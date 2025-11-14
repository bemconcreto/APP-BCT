import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

//
// CLIENTE PARA VALIDAR O TOKEN DO USUÁRIO
//
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

//
// CLIENTE ADMIN (SERVICE ROLE) PARA SALVAR NO BANCO
//
const supabaseAdmin = createClient(
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

    // token enviado pelo front
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Token não enviado",
      });
    }

    //
    // 1️⃣ VALIDAR SESSÃO DO USUÁRIO
    //
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({
        success: false,
        error: "Usuário não autenticado",
      });
    }

    const user = authData.user;

    //
    // 2️⃣ PEGAR WALLET DO USER
    //
    const userWallet = user.user_metadata?.wallet ?? null;
    if (!userWallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet não encontrada",
      });
    }

    //
    // 3️⃣ CRIAR O PEDIDO (ADMIN)
    //
    const { data, error } = await supabaseAdmin
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
      console.error("Erro Supabase:", error);
      return NextResponse.json({
        success: false,
        error: "Erro ao salvar no banco",
      });
    }

    //
    // 4️⃣ SUCESSO
    //
    return NextResponse.json({
      success: true,
      id: data.id,
    });

  } catch (e) {
    console.error("ERRO INTERNO:", e);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    });
  }
}