import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Webhook ASAAS recebido:", body);

    if (!body?.event || !body?.payment?.id) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { event, payment } = body;

    if (event !== "PAYMENT_CONFIRMED") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const paymentId = payment.id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: compra } = await supabase
      .from("compras_bct")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (!compra) {
      console.log("⚠ Compra não encontrada no Supabase");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const user_id = compra.user_id;
    const tokens = Number(compra.tokens);

    const { data: wallet } = await supabase
      .from("wallet_saldos")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!wallet) {
      await supabase
        .from("wallet_saldos")
        .insert({
          user_id,
          saldo_bct: tokens
        });
    } else {
      await supabase
        .from("wallet_saldos")
        .update({
          saldo_bct: Number(wallet.saldo_bct) + tokens
        })
        .eq("user_id", user_id);
    }

    await supabase
      .from("compras_bct")
      .update({ status: "paid" })
      .eq("id", compra.id);

    console.log("🎉 Tokens creditados!");

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error("❌ ERRO WEBHOOK:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export function GET() {
  return NextResponse.json({ ok: true });
}