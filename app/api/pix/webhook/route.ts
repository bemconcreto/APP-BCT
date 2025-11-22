// app/api/pix/webhook/route.ts
import { NextResponse } from "next/server";

// O ASAAS envia WEBHOOK como POST RAW → impedir bodyParser automático
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    // 1) Ler o body sem parse automático
    const rawText = await req.text();

    let payload: any = {};
    try {
      payload = JSON.parse(rawText);
    } catch {
      // Asaas pode mandar um JSON esquisito (aspas simples ou campos fora do padrão)
      payload = {};
    }

    console.log("📌 WEBHOOK RECEBIDO:", payload);

    // 2) Extrair ID do pagamento (aceitar múltiplos formatos)
    const paymentId =
      payload?.payment?.id ||
      payload?.id ||
      payload?.paymentId ||
      payload?.data?.id;

    if (!paymentId) {
      console.log("❌ paymentId ausente, ignorando webhook");
      return NextResponse.json({ success: true });
    }

    console.log("📌 paymentId recebido:", paymentId);

    // ⚠ IMPORTANTE:
    // Aqui devolvemos 200 SEM FAZER NADA
    // Só para o Asaas aceitar e não retornar erro.
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);

    // Mesmo em erro, devolver 200 para o Asaas não bloquear webhook
    return NextResponse.json({ success: true });
  }
}

// ⚠ NÃO adicionar GET nessa rota — webhook só aceita POST