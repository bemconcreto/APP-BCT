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

    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    const description = `Compra de ${tokens} BCT via PIX`;

    // CRIA PAGAMENTO NO ASAAS
    const resultado = await criarPagamentoAsaas({
      customerId: ASAAS_CUSTOMER_ID,
      value: amountBRL,
      billingType: "PIX",
      description,
    });

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

    // 🔥 Ajuste correto do retorno PIX (formato oficial ASAAS)
    const pixQrCode = payment.pix?.qrCode ?? null;
    const pixCopiaECola = payment.pix?.payload ?? null;

    return NextResponse.json({
      success: true,
      id: payment.id ?? null,
      status: payment.status ?? "PENDING",
      pixQrCode,
      pixCopiaECola,
    });
  } catch (e) {
    console.error("Erro rota PIX:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}