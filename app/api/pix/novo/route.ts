import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amountBRL, tokens } = await req.json();

    if (!amountBRL || !tokens)
      return NextResponse.json({ success: false, error: "Dados inválidos" });

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY)
      return NextResponse.json({ success: false, error: "Asaas API Key faltando" });

    // 🔥 Cria cobrança PIX no Asaas
    const response = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY,
      },
      body: JSON.stringify({
        billingType: "PIX",
        value: Number(amountBRL),
        description: `Compra de ${tokens.toFixed(4)} BCT`,
        dueDate: new Date().toISOString().split("T")[0],
      }),
    });

    const data = await response.json();

    if (!data.id)
      return NextResponse.json({ success: false, error: "Erro ao criar cobrança Pix" });

    // 🔥 Pega QR Code Pix
    const qr = await fetch(`https://api.asaas.com/v3/payments/${data.id}/pixQrCode`, {
      headers: {
        "access_token": ASAAS_API_KEY,
      },
    });

    const qrData = await qr.json();

    return NextResponse.json({
      success: true,
      id: data.id,
      value: amountBRL,
      qrCodeBase64: qrData?.encodedImage ?? null,
      copiaECola: qrData?.payload ?? null,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Erro interno no servidor" });
  }
}