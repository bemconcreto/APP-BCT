import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,             // ✔ URL correta
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✔ Service Role correta
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
      return NextResponse.json({
        success: false,
        error: "Erro ao salvar no banco",
      });
    }

    // retorna o ID do pedido
    return NextResponse.json({
      success: true,
      id: data.id,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    });
  }
}