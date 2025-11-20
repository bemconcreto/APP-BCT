import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      wallet,
      tokens,
      value_brl,
      payment_id,
      method
    } = body;

    if (!user_id || !wallet || !tokens || !value_brl || !payment_id) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // Conecta ao Supabase como backend (service role)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Grava a compra na tabela correta
    const { error } = await supabase
      .from("compras_bct")
      .insert({
        user_id,
        wallet,
        tokens,
        value_brl,
        payment_id,
        status: "pending",
        method
      });

    if (error) {
      console.error("Erro ao registrar compra:", error);
      return NextResponse.json(
        { success: false, error: "Falha ao salvar compra." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ERRO /comprar-bct:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}