import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const ASAAS_CUSTOMER_ID = process.env.ASAAS_CUSTOMER_ID;

    if (!ASAAS_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API KEY da Asaas não encontrada." },
        { status: 500 }
      );
    }

    if (!ASAAS_CUSTOMER_ID) {
      return NextResponse.json(
        { success: false, error: "AS AAS CUSTOMER ID não configurado." },
        { status: 500 }
      );
    }

    const { amount, tokens } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // Criar pagamento via CHECKOUT ASAAS
    const pagamento = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: ASAAS_CUSTOMER_ID,
        billingType: "CREDIT_CARD",
        value: Number(amount),
        dueDate: new Date().toISOString().split("T")[0],
        description: `Compra de ${tokens} BCT pelo app`,
      }),
    });

    const resultado = await pagamento.json();

    if (!resultado?.invoiceUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao gerar checkout do cartão.",
          detalhe: resultado,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultado.id,
      url: resultado.invoiceUrl,
    });
  } catch (err) {
    console.error("ERRO CHECKOUT CARTAO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}