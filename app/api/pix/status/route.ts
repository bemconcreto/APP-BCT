import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ success: false, error: "ID não enviado" });

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY)
      return NextResponse.json({ success: false, error: "Asaas API Key faltando" });

    // pega QR code
    const qr = await fetch(`https://api.asaas.com/v3/payments/${id}/pixQrCode`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    });

    const qrData = await qr.json();

    // pega valor
    const payment = await fetch(`https://api.asaas.com/v3/payments/${id}`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    });

    const payData = await payment.json();

    return NextResponse.json({
      success: true,
      qrCodeBase64: qrData.encodedImage,
      copiaECola: qrData.payload,
      value: payData.value,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({
      success: false,
      error: "Erro interno",
    });
  }
}