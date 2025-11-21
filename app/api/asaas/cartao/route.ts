import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL } = body;

    if (!nome || !numero || !mes || !ano || !cvv) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    // ASAAS CARTÃO
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_TOKEN!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "CREDIT_CARD",
        value: amountBRL,
        description: "Pagamento BCT",
        creditCard: {
          holderName: nome,
          number: numero,
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv,
        },
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    console.error("ERRO CARTÃO:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}