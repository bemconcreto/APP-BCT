import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const { amount, tokens } = await req.json();

    // amountBRL → amount
    const amountBRL = Number(amount);

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // ID do cliente (fixo por enquanto)
    const customerId = process.env.ASAAS_CUSTOMER_ID;
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    const description = `Compra de ${tokens} BCT pelo app`;

    // Criar pagamento PIX
    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "PIX",
      description,
    });

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error, detalhe: resultado.data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultado.data.id,
      pix: resultado.data.pixQrCode,
      copiaCola: resultado.data.pixCopiaECola,
    });

  } catch (e: any) {
    console.error("Erro rota PIX:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Erro interno." },
      { status: 500 }
    );
  }
}