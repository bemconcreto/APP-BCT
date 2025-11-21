import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL, cpfCnpj, email } = body;

    // 1. Validação básica
    if (!nome || !numero || !mes || !ano || !cvv) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    // 2. Validação ASAAS
    if (!cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "CPF e email são obrigatórios." },
        { status: 400 }
      );
    }

    // 3. Montagem do pagamento
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
          number: numero.replace(/\s/g, ""),
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv,
        },

        creditCardHolderInfo: {
          name: nome,
          email,
          cpfCnpj,
          postalCode: "00000000",
          address: "Não informado",
          addressNumber: "0",
          phone: "11999999999"
        },

      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha no pagamento." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });

  } catch (e) {
    console.error("ERRO CARTÃO:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}