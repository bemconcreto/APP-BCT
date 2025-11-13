import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || !tokens) {
      return NextResponse.json({ success: false, error: "Dados inválidos" });
    }

    // cria o pedido no Supabase
    const { data, error } = await supabase
      .from("payments")
      .insert({
        amount_brl: amountBRL,
        tokens,
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Erro ao salvar no banco" });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Erro interno" });
  }
}