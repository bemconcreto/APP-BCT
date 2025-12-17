import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    /* ================= FATURAMENTO ================= */

    const { data: vendas, error } = await supabase
      .from("vendas_bct")
      .select("valor_total, status");

    if (error) {
      console.error("❌ ERRO SUPABASE:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // considera apenas vendas pagas
    const vendasPagas = vendas.filter(
      (v) => v.status === "paga" || v.status === "paid"
    );

    const faturamentoTotal = vendasPagas.reduce(
      (acc, v) => acc + Number(v.valor_total || 0),
      0
    );

    const vendasBCT = vendasPagas.length;

    /* ================= POOLS ================= */

    const poolLiquidez = faturamentoTotal * 0.3;
    const poolReserva = faturamentoTotal * 0.2;
    const poolImoveis = faturamentoTotal * 0.3;

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      faturamentoTotal,
      vendasBCT,
      poolLiquidez,
      poolReserva,
      poolImoveis,
    });
  } catch (err) {
    console.error("❌ ERRO GERAL FINANCEIRO:", err);
    return NextResponse.json(
      { error: "Erro ao gerar resumo financeiro" },
      { status: 500 }
    );
  }
}