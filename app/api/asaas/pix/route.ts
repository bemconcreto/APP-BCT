import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL } = body;

    if (!amountBRL || Number(amountBRL) <= 0) {
      return NextResponse.json({
        success: false,
        error: "Valor inválido",
      });
    }

    const apiKey = process.env.ASAAS_API_KEY!;
    const customerId = process.env.ASAAS_CUSTOMER_ID!;

    if (!apiKey || !customerId) {
      return NextResponse.json({
        success: false,
        error: "Variáveis ASAAS_API_KEY ou ASAAS_CUSTOMER_ID faltando",
      });
    }

    const response = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: Number(amountBRL),
        description: "Compra de BCT via PIX",
      }),
    });

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json({
        success: false,
        error: result.errors[0]?.description || "Erro no Asaas",
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: result.id,
      pixCopyPaste: result.pixCopyPasteKey,
      qrCodeImage: result.pixQrCodeImageUrl,
    });
  } catch (e) {
    console.error("Erro PIX:", e);
    return NextResponse.json({
      success: false,
      error: "Erro interno no servidor",
    });
  }
}