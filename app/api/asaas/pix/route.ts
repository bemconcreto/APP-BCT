import { NextResponse } from "next/server";

// ====================================================================
//  PIX via ASAAS - Criação de Cobrança PIX
// ====================================================================

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

    // 🔐 Pega variáveis de ambiente
    const apiKey = process.env.ASAAS_API_KEY!;
    const customerId = process.env.ASAAS_CUSTOMER_ID!;

    if (!apiKey || !customerId) {
      return NextResponse.json({
        success: false,
        error: "Configuração da API incorreta (API KEY ou Customer ID não encontrados)",
      });
    }

    // ====================================================================
    //  Cria cobrança PIX no ASAAS
    // ====================================================================

    const response = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: apiKey, // 🔥 sem $ — API KEY pura
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: Number(amountBRL),
        description: "Compra de BCT via PIX",
      }),
    });

    const result = await response.json();
    console.log("ASAAS PIX RESULT:", result);

    // Erro vindo do Asaas
    if (result.errors) {
      return NextResponse.json({
        success: false,
        error: result.errors[0]?.description || "Erro no Asaas",
      });
    }

    // Resposta correta
    return NextResponse.json({
      success: true,
      pixCopyPaste: result.pixCopyPasteKey,
      qrCodeImage: result.pixQrCodeImageUrl,
      paymentId: result.id,
    });
  } catch (e) {
    console.error("Erro PIX:", e);
    return NextResponse.json({
      success: false,
      error: "Erro interno no servidor",
    });
  }
}