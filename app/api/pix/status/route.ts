import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não informado" },
        { status: 400 }
      );
    }

    const key = process.env.ASAAS_API_KEY;

    // 1️⃣ Buscar dados básicos do pagamento
    const base = await fetch(`https://www.asaas.com/api/v3/payments/${id}`, {
      headers: {
        accept: "application/json",
        access_token: key!,
      },
    }).then(r => r.json());

    // 2️⃣ Buscar QR Code real
    const pix = await fetch(
      `https://www.asaas.com/api/v3/payments/${id}/pixQrCode`,
      {
        headers: {
          accept: "application/json",
          access_token: key!,
        },
      }
    ).then(r => r.json());

    return NextResponse.json({
      success: true,
      status: base.status,               // aguardando pagamento, confirmado, etc
      qrCode: pix?.encodedImage || null, // QR real
      copiaCola: pix?.payload || null,   // copia e cola real
    });

  } catch (e) {
    console.error("STATUS ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Erro inesperado." },
      { status: 500 }
    );
  }
}