import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData } = await sup.auth.getUser(token);

      userId = userData?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 1) Buscar carteira existente
    let { data: carteira } = await supabaseAdmin
      .from("wallet_cash")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 2) Se não existir → criar automaticamente
    if (!carteira) {
      const { data: novaCarteira, error } = await supabaseAdmin
        .from("wallet_cash")
        .insert({
          user_id: userId,
          saldo_brl: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("ERRO ao criar carteira:", error);
        return NextResponse.json(
          { success: false, error: "Erro ao criar carteira." },
          { status: 500 }
        );
      }

      carteira = novaCarteira;
    }

    return NextResponse.json({
      success: true,
      saldo_brl: Number(carteira.saldo_brl),
      carteira,
    });
  } catch (err) {
    console.error("ERRO API CARTEIRA:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}