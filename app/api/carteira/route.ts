// app/api/carteira/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer "))
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const token = auth.split(" ")[1];

    const sup = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await sup.auth.getUser(token);
    const userId = userData?.user?.id;

    if (!userId)
      return NextResponse.json({ success: false, error: "Usuário não autenticado" }, { status: 401 });

    // 🔥 BUSCA TODAS AS LINHAS DA WALLET_CASH DO USUÁRIO
    const { data: rows, error } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_cash")
      .eq("user_id", userId);

    if (error) {
      console.error("ERRO AO CONSULTAR WALLET:", error);
      return NextResponse.json({ success: false, error: "Erro ao consultar carteira" });
    }

    // 🔥 SOMA TODAS AS LINHAS
    let total = 0;
    if (Array.isArray(rows)) {
      total = rows.reduce((acc: number, r: any) => acc + Number(r.saldo_cash || 0), 0);
    }

    return NextResponse.json({
      success: true,
      saldo_brl: Number(total.toFixed(2)),
    });

  } catch (err) {
    console.error("ERRO API CARTEIRA:", err);
    return NextResponse.json({ success: false, error: "Erro interno" });
  }
}