import { NextResponse } from "next/server";

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

    // 📌 Asaas exige dueDate SEMPRE
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const pagamento = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: amountBRL,
        description: `Compra de ${tokens} BCT via PIX`,
        dueDate: dueDate.toISOString().split("T")[0], // formato YYYY-MM-DD
        cpfCnpj: cpfCnpj // obrigatório!
      }),
    });

    const resultado = await pagamento.json();

    if (!resultado.id) {
      return NextResponse.json(
        { success: false, error: resultado.errors ?? resultado },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultado.id,
      pixQrCode: resultado.pixQrCode,
      pixCopiaECola: resultado.pixCopiaECola,
      status: resultado.status,
    });
  } catch (err) {
    console.error("ERRO PIX Backend:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}