import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || !tokens) {
      return NextResponse.json({
        success: false,
        error: "Dados inválidos",
      });
    }

    // 🔍 verifica usuário pelo token passado via header Authorization
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Token não enviado",
      });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: "Usuário não autenticado",
      });
    }

    // 🔗 pega wallet do usuário
    const userWallet = user.user_metadata?.wallet ?? null;

    if (!userWallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet não encontrada",
      });
    }

    // 💾 cria o pedido
    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_wallet: userWallet,
        amount_brl: amountBRL,
        tokens,
        payment_method: "pix",
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