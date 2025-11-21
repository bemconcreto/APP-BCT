import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Webhook recebido do ASAAS:", body);

    // Proteção caso o ASAAS envie payload incompleto
    if (!body?.event || !body?.payment?.id) {
      console.log("❗ Webhook ignorado — dados incompletos");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { event, payment } = body;

    // 🔥 Só processa pagamento confirmado
    if (event !== "PAYMENT_CONFIRMED") {
      console.log("📌 Evento ignorado:", event);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const paymentId = payment.id;
    const valorPago = Number(payment.value);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1️⃣ Buscar compra no Supabase
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (compraErr || !compra) {
      console.log("❗ Compra não encontrada:", paymentId);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const user_id = compra.user_id;
    const tokens = Number(compra.tokens);

    // 2️⃣ Buscar saldo existente
    const { data: wallet, error: walletErr } = await supabase
      .from("wallet_saldos")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    // Caso não exista — criar a carteira do usuário
    if (!wallet) {
      console.log("🟢 Criando novo saldo para usuário...");

      await supabase.from("wallet_saldos").insert({
        user_id,
        saldo_bct: tokens,
      });

    } else {
      // Caso exista — somar tokens
      const novoSaldo = Number(wallet.saldo_bct) + tokens;

      console.log("🟢 Atualizando saldo:", novoSaldo);

      await supabase
        .from("wallet_saldos")
        .update({ saldo_bct: novoSaldo })
        .eq("user_id", user_id);
    }

    // 3️⃣ Marcar compra como paga
    await supabase
      .from("compras_bct")
      .update({ status: "paid" })
      .eq("id", compra.id);

    console.log("🎉 Tokens creditados com sucesso!");

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error("❌ ERRO WEBHOOK:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Webhook ASAAS ativo" });
}