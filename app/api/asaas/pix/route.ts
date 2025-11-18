import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const { amountBRL, tokens } = await req.json();

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // ID DO CLIENTE ASAAS (definido no painel)
    const customerId = process.env.ASAAS_CUSTOMER_ID;
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    // DESCRIÇÃO PADRÃO DO PAGAMENTO
    const description = `Compra de ${tokens} BCT pelo app`;

    // 🔥 CRIA O PAGAMENTO PIX
    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "PIX",
      description,
    });

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultado.data.id,
      pix: resultado.data.pixQrCode,
      copiaCola: resultado.data.pixCopiaECola,
    });
  } catch (e) {
    console.error("Erro rota PIX:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}