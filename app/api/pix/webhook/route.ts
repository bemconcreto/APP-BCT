// app/api/pix/webhook/route.ts
import { NextResponse } from "next/server";

// O ASAAS NÃO envia JSON puro → precisamos aceitar RAW
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    // 1) Ler body RAW como texto
    const rawText = await req.text();

    let payload: any = {};
    try {
      payload = JSON.parse(rawText);
    } catch {
      // ASAAS às vezes envia aspas erradas; continuar mesmo assim
      payload = {};
    }

    console.log("📌 WEBHOOK RECEBIDO:", payload);

    // 2) Extrair paymentId
    const paymentId =
      payload?.payment?.id ||
      payload?.id ||
      payload?.paymentId ||
      payload?.data?.id;

    if (!paymentId) {
      console.log("❌ paymentId ausente no webhook");
      return NextResponse.json({ success: false }, { status: 200 });
    }

    console.log("📌 paymentId:", paymentId);

    // NÃO vamos processar nada agora (para evitar 400)
    // Apenas devolver OK pro Asaas
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ success: true });
  }
}

// SO MOVE: NÃO PODE TER GET