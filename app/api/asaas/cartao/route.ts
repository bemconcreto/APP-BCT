import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY RECEBIDO:", body);

    const { nome, numero, mes, ano, cvv, amountBRL, cpfCnpj, email } = body;

    // 🔥 VALIDAÇÃO
    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL || !cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos para pagamento com cartão." },
        { status: 400 }
      );
    }

    // 🔥 REQUISIÇÃO CORRETA PARA CARTÃO NO ASAAS
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
        description: "Compra de BCT",
        dueDate: new Date().toISOString().split("T")[0],

        creditCard: {
          holderName: nome,
          number: numero,
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv
        },

        creditCardHolderInfo: {
          name: nome,
          email: email,
          cpfCnpj: cpfCnpj,
        },
      }),
    });

    const data = await resp.json();
    console.log("RESPOSTA ASAAS:", data);

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha no pagamento" },
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