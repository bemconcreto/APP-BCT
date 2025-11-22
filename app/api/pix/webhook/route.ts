import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Asaas envia RAW
export const config = {
  api: { bodyParser: false },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const raw = await req.text();

    let payload: any = {};
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }

    console.log("📌 WEBHOOK RECEBIDO:", payload);

    // 1️⃣ Identificar pagamento
    const paymentId =
      payload?.payment?.id ||
      payload?.id ||
      payload?.paymentId ||
      payload?.data?.id;

    if (!paymentId) {
      console.log("❌ paymentId ausente");
      return NextResponse.json({ success: true });
    }

    console.log("📌 paymentId:", paymentId);

    // 2️⃣ Consultar status real no ASAAS
    const asaasRes = await fetch(
      `https://www.asaas.com/api/v3/payments/${paymentId}`,
      {
        headers: {
          accept: "application/json",
          access_token: process.env.ASAAS_API_KEY!,
        },
      }
    );

    const dados = await asaasRes.json();
    console.log("📌 STATUS REAL ASAAS:", dados.status);

    const pago = ["RECEIVED", "CONFIRMED", "PAID", "SETTLED"].includes(
      (dados.status || "").toUpperCase()
    );

    if (!pago) {
      console.log("⏳ Pagamento ainda não confirmado:", dados.status);
      return NextResponse.json({ success: true });
    }

    // 3️⃣ Atualizar tabela compras_bct
    const { error } = await supabase
      .from("compras_bct")
      .update({ status: "paid" })
      .eq("payment_id", paymentId);

    if (error) {
      console.log("❌ ERRO update compras_bct:", error);
    } else {
      console.log("✅ COMPRA MARCADA COMO PAGA!");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ success: true });
  }
}