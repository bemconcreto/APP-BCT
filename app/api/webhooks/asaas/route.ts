import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Aceita body como texto e converte
async function parseAsaasRequest(req: Request) {
  const raw = await req.text();

  try {
    return JSON.parse(raw);
  } catch {
    // Caso o ASAAS envie como x-www-form-urlencoded
    const params = new URLSearchParams(raw);
    const json = Object.fromEntries(params.entries());

    if (json["payment"]) {
      try {
        json["payment"] = JSON.parse(json["payment"]);
      } catch {}
    }

    return json;
  }
}

export async function POST(req: Request) {
  const body = await parseAsaasRequest(req);

  console.log("📩 Webhook Asaas recebido:", body);

  // Validação mínima
  if (!body?.event || !body?.payment) {
    console.log("❌ Payload sem event/pagamento");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { event, payment } = body;

  // Ignorar eventos não confirmados
  if (event !== "PAYMENT_CONFIRMED") {
    console.log("🔎 Evento ignorado:", event);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Somente confirmações
  const paymentId = payment.id;
  const valorPago = Number(payment.value);

  if (!paymentId || !valorPago) {
    console.log("❌ Pagamento inválido", payment);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  console.log("💰 Pagamento confirmado:", paymentId);

  // Conectar Supabase admin
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Buscar compra
  const { data: compra } = await supabase
    .from("compras_bct")
    .select("*")
    .eq("payment_id", paymentId)
    .single();

  if (!compra) {
    console.log("⚠️ Compra não encontrada:", paymentId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Creditar tokens
  await supabase.rpc("creditar_bct", {
    wallet: compra.wallet,
    qtd_tokens: compra.tokens
  });

  // Atualizar status
  await supabase
    .from("compras_bct")
    .update({ status: "paid" })
    .eq("payment_id", paymentId);

  console.log("✅ Tokens creditados com sucesso!");

  return NextResponse.json({ ok: true }, { status: 200 });
}

export function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}