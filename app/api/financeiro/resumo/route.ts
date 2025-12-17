import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    /* ================= BUSCA VENDAS ================= */

    const { data: vendas, error } = await supabase
      .from("vendas_bct")
      .select("*");

    if (error) {
      console.error("❌ ERRO SUPABASE:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!vendas || vendas.length === 0) {
      return NextResponse.json({
        faturamentoTotal: 0,
        vendasBCT: 0,
        poolLiquidez: 0,
        poolReserva: 0,
        poolImoveis: 0,
      });
    }

    /* ================= DESCOBRE CAMPO DE VALOR ================= */

    const exemplo = vendas[0];

    const campoValor = Object.keys(exemplo).find((k) =>
      k.toLowerCase().includes("valor")
    );

    if (!campoValor) {
      return NextResponse.json(
        { error: "Campo de valor não encontrado em vendas_bct" },
        { status: 500 }
      );
    }

    /* ================= FILTRA PAGAS ================= */

const vendasPagas = vendas.filter(
  (v) => Number(v[campoValor]) > 0
);

    const faturamentoTotal = vendasPagas.reduce(
      (acc, v) => acc + Number(v[campoValor] || 0),
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
      campoValorUsado: campoValor, // 🔍 debug útil
    });
  } catch (err) {
    console.error("❌ ERRO FINANCEIRO:", err);
    return NextResponse.json(
      { error: "Erro ao gerar resumo financeiro" },
      { status: 500 }
    );
  }
}