// app/api/pix/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// ---- CONFIG ----
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY!; // sua key Asaas
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!; // já configurada no Vercel
const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-rpc.com";
const BCT_CONTRACT_ADDRESS = process.env.BCT_CONTRACT_ADDRESS || "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";
const BCT_DECIMALS = Number(process.env.BCT_DECIMALS || "18");

// ---- Supabase (Service Role — uso no server) ----
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Minimal ERC20 ABI (transfer)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)",
];

// Helper: call Asaas to verify payment
async function fetchAsaasPayment(paymentId: string) {
  const url = `https://www.asaas.com/api/v3/payments/${encodeURIComponent(paymentId)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ASAAS_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Asaas API error ${res.status}: ${txt}`);
  }
  return await res.json();
}

// Helper: send ERC20 tokens on Polygon
async function sendTokens(to: string, amountTokens: string) {
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(BCT_CONTRACT_ADDRESS, ERC20_ABI, wallet);

  // parse amount according to decimals
  const amount = ethers.parseUnits(amountTokens, BCT_DECIMALS);
  const tx = await contract.transfer(to, amount);
  await tx.wait();
  return tx.hash;
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let payload: any;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      // Asaas may send form-encoded or other. Try to parse as JSON-safe fallback.
      payload = {};
    }

    // Asaas webhook typically contains 'payment' object or 'id' — adapt: accept payment.id or paymentId in body
    // Prioritize reading an 'payment' object with 'id' or look for 'id' / 'paymentId'
    const paymentId =
      payload?.payment?.id ||
      payload?.id ||
      payload?.paymentId ||
      payload?.data?.id ||
      payload?.object?.id; // flexibility

    if (!paymentId) {
      return NextResponse.json({ success: false, error: "payment id not found in webhook" }, { status: 400 });
    }

    // 1) Validate payment status at Asaas (prevents spoofed webhooks)
    let asaasData: any;
    try {
      asaasData = await fetchAsaasPayment(paymentId);
    } catch (err: any) {
      console.error("Erro ao consultar Asaas:", err);
      return NextResponse.json({ success: false, error: "Asaas validation failed" }, { status: 500 });
    }

    // Asaas status names vary (CONFIRMED / PAID / RECEIVED). Accept common success statuses.
    const paidStatuses = ["CONFIRMED", "PAID", "RECEIVED", "SETTLED", "CONFIRMED_BY_PSP"];
    const asaasStatus = (asaasData?.status || "").toString().toUpperCase();

    if (!paidStatuses.includes(asaasStatus)) {
      // Not paid yet — just ignore (but respond 200 so Asaas won't retry jam)
      console.log(`Asaas status ${asaasStatus} for payment ${paymentId} — ignoring`);
      return NextResponse.json({ success: true, ignored: true, status: asaasStatus });
    }

    // 2) Find our payment record in Supabase (match by external reference if you stored paymentId there).
    // Here we'll search payments table for a row with asaas_payment_id OR id equal to paymentId
    // Adjust column names if different.
    // Prefer to find by asaas_payment_id column; fallback to payments.id numeric.
    const { data: existingByAsaas, error: errAsaasSearch } = await supabase
      .from("payments")
      .select("*")
      .eq("asaas_payment_id", paymentId)
      .limit(1)
      .maybeSingle();

    let paymentRow: any = existingByAsaas;

    if (!paymentRow) {
      // fallback: maybe we stored paymentId in 'external_id' or used Supabase-generated id.
      const { data: byId, error: errIdSearch } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .limit(1)
        .maybeSingle();

      paymentRow = byId;
    }

    if (!paymentRow) {
      console.warn("Pedido não encontrado no payments para paymentId:", paymentId);
      // Optionally: create an entry? for safety, return 200 so Asaas doesn't keep retrying
      return NextResponse.json({ success: false, error: "payment record not found" }, { status: 404 });
    }

    // Idempotência: se já pago / já tem tx_hash, ignore
    if (paymentRow.status === "pago" || paymentRow.tx_hash) {
      console.log("Pedido já processado:", paymentRow.id);
      return NextResponse.json({ success: true, id: paymentRow.id, alreadyProcessed: true });
    }

    // Ensure we have the user's wallet to send to
    const userWallet = paymentRow.user_wallet || paymentRow.user_wallet_address || paymentRow.user_wallet_address_hex;
    if (!userWallet) {
      console.error("Wallet do usuário não encontrada no pedido:", paymentRow.id);
      // update status to erro?
      await supabase
        .from("payments")
        .update({ status: "erro", error_message: "user wallet missing" })
        .eq("id", paymentRow.id);
      return NextResponse.json({ success: false, error: "user wallet not found" }, { status: 400 });
    }

    // Calculate how many tokens to send:
    // we assume you saved tokens numeric in table, or amount_brl + token price are available.
    // Prefer stored 'tokens' column:
    const tokensToSend = Number(paymentRow.tokens);
    if (!tokensToSend || tokensToSend <= 0) {
      console.error("Tokens inválidos para pedido:", paymentRow.id, paymentRow.tokens);
      await supabase
        .from("payments")
        .update({ status: "erro", error_message: "invalid tokens amount" })
        .eq("id", paymentRow.id);
      return NextResponse.json({ success: false, error: "invalid tokens amount" }, { status: 400 });
    }

    // 3) Execute transfer on chain
    let txHash: string | null = null;
    try {
      // tokensToSend might be float — convert to string preserving decimals
      const tokensString = tokensToSend.toString();
      txHash = await sendTokens(userWallet, tokensString);
      console.log("Transfer realizado:", txHash);
    } catch (err: any) {
      console.error("Erro ao enviar tokens:", err);
      await supabase
        .from("payments")
        .update({ status: "erro", error_message: `transfer_error: ${String(err?.message ?? err)}` })
        .eq("id", paymentRow.id);
      return NextResponse.json({ success: false, error: "transfer failed" }, { status: 500 });
    }

    // 4) Atualiza registro no Supabase como pago + tx_hash
    await supabase
      .from("payments")
      .update({
        status: "pago",
        tx_hash: txHash,
        transferred_at: new Date().toISOString(),
        asaas_status: asaasStatus,
      })
      .eq("id", paymentRow.id);

    return NextResponse.json({ success: true, id: paymentRow.id, txHash });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}