import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // ===== FATURAMENTO =====
    const { data: vendas, error: vendasError } = await supabase
      .from("vendas")
      .select("valor_total")
      .eq("status", "paga");

    if (vendasError) throw vendasError;

    const faturamentoTotal =
      vendas?.reduce((acc, v) => acc + Number(v.valor_total), 0) || 0;

    return NextResponse.json({
      faturamentoTotal,
    });
  } catch (err) {
    console.error("❌ ERRO FINANCEIRO:", err);
    return NextResponse.json(
      { error: "Erro ao buscar resumo financeiro" },
      { status: 500 }
    );
  }
}