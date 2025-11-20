import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const ASAAS_CUSTOMER_ID = process.env.ASAAS_CUSTOMER_ID;

    if (!ASAAS_CUSTOMER_ID) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    // PEGANDO BODY
    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    const description = `Compra de ${tokens} BCT via PIX`;

    // 🔥 CHAMADA PARA CRIAR O PAGAMENTO PIX
    const resultado = await criarPagamentoAsaas({
      customerId: ASAAS_CUSTOMER_ID,
      value: amountBRL,
      billingType: "PIX",
      description,
    });

    // Proteção contra undefined
    if (!resultado.success || !resultado.data) {
      return NextResponse.json(
        {
          success: false,
          error: resultado.error ?? "Erro desconhecido ao criar PIX",
        },
        { status: 500 }
      );
    }

    const payment = resultado.data;

    return NextResponse.json({
      success: true,
      id: payment.id ?? null,
      pixQrCode: payment.pixQrCode ?? null,
      pixCopiaECola: payment.pixCopiaECola ?? null,
      status: payment.status ?? "PENDING",
    });
  } catch (e) {
    console.error("Erro rota PIX:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}