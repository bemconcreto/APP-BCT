import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { ethers } from "ethers";

const MINT_WALLET = process.env.BCT_WALLET_ADMIN!; // sua wallet privada SECRETA
const CONTRACT_ADDRESS = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";

const ABI = [
  "function mint(address to, uint256 amount) external"
];

export async function POST(req: Request) {
  const { id } = await req.json();

  // Buscar pagamento
  const { data: payment } = await supabase
    .from("pix_payments")
    .select("*")
    .eq("id", id)
    .single();

  if (!payment) {
    return NextResponse.json({ success: false, error: "Pagamento não encontrado." });
  }

  // ⚠️ Já confirmado?
  if (payment.status === "paid") {
    return NextResponse.json({ success: false, error: "Pagamento já confirmado." });
  }

  // MARCAR COMO PAGO NO BANCO
  await supabase
    .from("pix_payments")
    .update({ status: "paid" })
    .eq("id", id);

  // 🔥 MINT AUTOMÁTICO
  const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
  const wallet = new ethers.Wallet(MINT_WALLET, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  const tokens = Math.floor((payment.amount / 2.3786) * 1e18);

  await contract.mint(payment.wallet, tokens);

  return NextResponse.json({ success: true });
}