import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ⚠ Supabase client para rotas server-side (com cookies)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${cookies().get("sb-access-token")?.value ?? ""}`,
        },
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || !tokens) {
      return NextResponse.json({
        success: false,
        error: "Dados inválidos",
      });
    }

    // 🔍 Busca usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Usuário não autenticado",
      });
    }

    // carrega wallet do usuário
    const userWallet = user?.user_metadata?.wallet ?? null;

    if (!userWallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet não encontrada no perfil do usuário",
      });
    }

    // cria o pedido no Supabase
    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_wallet: userWallet,
        amount_brl: amountBRL,
        tokens: tokens,
        payment_method: "pix",
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro no Supabase:", error);
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
    console.error("Erro interno:", e);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    });
  }
}