// app/api/carteira/route.ts
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

      const { data } = await sup.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // busca saldo da carteira
    const { data: wallet, error } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_cash")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("ERRO AO CONSULTAR WALLET:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao carregar saldo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      saldo_brl: Number(wallet?.saldo_cash ?? 0),
    });
  } catch (err) {
    console.error("ERRO /api/carteira:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}