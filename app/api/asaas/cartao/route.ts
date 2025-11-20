import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const customerId = process.env.ASAAS_CUSTOMER_ID;

    if (!ASAAS_API_KEY || !customerId) {
      return NextResponse.json(
        { success: false, error: "Credenciais ASAAS ausentes." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amountBRL, tokens, cpfCnpj } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    if (!cpfCnpj) {
      return NextResponse.json(
        { success: false, error: "CPF/CNPJ é obrigatório." },
        { status: 400 }
      );
    }

    // 📌 dueDate obrigatório
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const description = `Compra de ${tokens} BCT (cartão)`;

    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "CREDIT_CARD",
      description,
      dueDate: dueDate.toISOString().split("T")[0],
      cpfCnpj
    });

    if (!resultado.success || !resultado.data) {
      return NextResponse.json(
        { success: false, error: resultado.error ?? "Erro ao criar pagamento." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultado.data.id,
      status: resultado.data.status,
    });
  } catch (err) {
    console.error("ERRO BACKEND CARTAO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}