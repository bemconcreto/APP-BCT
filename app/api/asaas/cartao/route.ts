import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

    if (!ASAAS_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API KEY da Asaas não encontrada." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      amountBRL,
      holderName,
      cpfCnpj,
      email,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    } = body;

    // -------------------------
    // 1. Validar campos
    // -------------------------
    if (
      !amountBRL ||
      !holderName ||
      !cpfCnpj ||
      !email ||
      !cardNumber ||
      !expiryMonth ||
      !expiryYear ||
      !cvv
    ) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // -------------------------
    // 2. Criar CLIENTE Asaas
    // -------------------------
    const criarCliente = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: holderName,
        cpfCnpj: cpfCnpj,
        email: email,
      }),
    });

    const cliente = await criarCliente.json();

    if (!cliente?.id) {
      return NextResponse.json(
        { success: false, error: "Erro ao criar cliente", detalhe: cliente },
        { status: 400 }
      );
    }

    // -------------------------
    // 3. Tokenizar cartão
    // -------------------------
    const tokenizar = await fetch("https://api.asaas.com/v3/creditCard/tokenize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        creditCard: {
          holderName,
          number: cardNumber,
          expiryMonth,
          expiryYear,
          ccv: cvv,
        },
      }),
    });

    const tokenizado = await tokenizar.json();

    if (!tokenizado?.creditCardToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao tokenizar cartão.",
          detalhe: tokenizado,
        },
        { status: 400 }
      );
    }

    // -------------------------
    // 4. Criar pagamento
    // -------------------------
    const pagamento = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "CREDIT_CARD",
        value: Number(amountBRL),
        creditCardToken: tokenizado.creditCardToken,
      }),
    });

    const resultado = await pagamento.json();

    if (!resultado?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar pagamento.",
          detalhe: resultado,
        },
        { status: 400 }
      );
    }

    // -------------------------
    // 5. Sucesso total
    // -------------------------
    return NextResponse.json({
      success: true,
      id: resultado.id,
      status: resultado.status,
    });
  } catch (err) {
    console.error("ERRO BACKEND CARTAO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}