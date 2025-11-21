import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // -----------------------------
    // LER BODY SEM ERRO
    // -----------------------------
    let body: any = null;

    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Body inválido" },
        { status: 400 }
      );
    }

    const { amountBRL, tokens, cpfCnpj, email, nome } = body || {};

    if (!amountBRL || !cpfCnpj || !email || !nome) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ASAAS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API KEY ausente" },
        { status: 500 }
      );
    }

    // -----------------------------
    // CRIA PAGAMENTO PIX NO ASAAS
    // -----------------------------
    const payload = {
      billingType: "PIX",
      value: Number(amountBRL),
      description: `Compra de ${tokens} BCT`,
      customer: cpfCnpj,
      dueDate: new Date().toISOString().slice(0, 10),
      pix: true,
    };

    const resposta = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const dados = await resposta.json();

    if (dados.errors) {
      return NextResponse.json(
        { success: false, error: dados.errors },
        { status: 400 }
      );
    }

    // resposta EXATA DO ASAAS
    return NextResponse.json({
      success: true,
      id: dados.id,
      qrCode: dados.pixQrCodeImage,
      copiaCola: dados.pixTransaction,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Erro inesperado no servidor" },
      { status: 500 }
    );
  }
}