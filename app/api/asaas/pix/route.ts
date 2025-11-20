import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const { amountBRL, tokens, cpfCnpj } = await req.json();

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    if (!cpfCnpj) {
      return NextResponse.json(
        { success: false, error: "CPF/CNPJ não informado." },
        { status: 400 }
      );
    }

    const customerId = process.env.ASAAS_CUSTOMER_ID;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    const description = `Compra de ${tokens} BCT`;

    // 🔥 CRIA O PAGAMENTO PIX COM CAMPOS OBRIGATÓRIOS
    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "PIX",
      description,
      extra: {
        cpfCnpj,
        dueDate: new Date().toISOString().split("T")[0], // data de hoje
      },
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