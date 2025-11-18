import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amountBRL } = await req.json();

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json({
        success: false,
        error: "Valor inválido",
      });
    }

    const customerId = process.env.148940098!;
    const apiKey = process.env.ASAAS_API_KEY!;

    if (!customerId || !apiKey) {
      return NextResponse.json({
        success: false,
        error: "Configuração ASAAS faltando",
      });
    }

    // Cria pagamento PIX
    const res = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: amountBRL,
        description: "Compra de BCT",
      }),
    });

    const data = await res.json();
    console.log("ASAAS RES:", data);

    if (data.errors) {
      return NextResponse.json({
        success: false,
        error: data.errors[0]?.description || "Erro ao criar pagamento",
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      qrCode: data.pixQrCode,
      qrCodeImage: data.pixQrCodeImage,
      expiration: data.dueDate,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      success: false,
      error: "Erro interno no servidor",
    });
  }
}