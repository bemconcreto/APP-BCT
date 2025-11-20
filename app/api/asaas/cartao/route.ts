import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";

export async function POST(req: Request) {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

    if (!ASAAS_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API KEY da Asaas não encontrada." },
        { status: 500 }
      );
    }

    // 🔥 AGORA SIM: PEGAMOS O BODY ANTES DE USAR!
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

    // Usa um único cliente fixo no ASAAS
    const customerId = process.env.ASAAS_CUSTOMER_ID;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    const description = `Compra de ${tokens} BCT (cartão)`;

    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "CREDIT_CARD",
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