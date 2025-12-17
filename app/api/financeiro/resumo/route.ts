import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    /* 🔐 SEGURANÇA BÁSICA */
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.APP_BCT_API_KEY}`) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    /* 💰 FATURAMENTO TOTAL (vendas pagas) */
    const faturamento = await prisma.venda.aggregate({
      where: { status: "paga" },
      _sum: { valorTotal: true },
    });

    /* 🧾 TOTAL DE VENDAS */
    const vendas = await prisma.venda.count({
      where: { status: "paga" },
    });

    /* 👥 USUÁRIOS */
    const usuarios = await prisma.usuario.count();

    return NextResponse.json({
      faturamentoTotal: faturamento._sum.valorTotal || 0,
      vendasBCT: vendas,
      usuarios,
    });
  } catch (error) {
    console.error("❌ ERRO FINANCEIRO APP-BCT:", error);

    return NextResponse.json(
      { error: "Erro ao gerar resumo financeiro" },
      { status: 500 }
    );
  }
}