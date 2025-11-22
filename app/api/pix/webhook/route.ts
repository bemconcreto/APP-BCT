import { NextResponse } from "next/server";

// Next.js 13/14 NÃO usa mais bodyParser → remover totalmente

export async function POST(req: Request) {
  try {
    // 1) RAW body (funciona no Next 13/14)
    const raw = await req.text();
    let payload: any = {};

    try {
      payload = JSON.parse(raw);
    } catch {
      console.log("⚠️ Payload não era JSON válido. Conteúdo recebido:");
      console.log(raw);
    }

    console.log("📌 WEBHOOK RECEBIDO:", payload);

    // 2) Extrair o paymentId corretamente
    const paymentId =
      payload?.payment?.id ||
      payload?.id ||
      payload?.paymentId ||
      payload?.data?.id;

    if (!paymentId) {
      console.log("❌ paymentId não encontrado.");
      // Mesmo assim, sempre responder 200 pro Asaas
      return NextResponse.json({ success: true });
    }

    console.log("📌 PAYMENT ID:", paymentId);

    // 👉 Aqui ainda NÃO processamos (para evitar 400)
    // Por enquanto só precisamos que o Asaas aceite o endpoint

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ ERRO NO WEBHOOK:", err);
    // Mesmo no erro → responder OK p/ Asaas não bloquear
    return NextResponse.json({ success: true });
  }
}

// ❌ NÃO COLOCAR GET