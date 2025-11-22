import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    const key = process.env.ASAAS_API_KEY;

    // 1️⃣ buscar info do pagamento
    const pagamento = await fetch(
      `https://www.asaas.com/api/v3/payments/${paymentId}`,
      {
        headers: { access_token: key! },
      }
    ).then(r => r.json());

    if (pagamento.status !== "CONFIRMED") {
      return NextResponse.json({ success: false, msg: "Pagamento não confirmado" });
    }

    const tokens = pagamento.description
      .replace("Compra de ", "")
      .replace(" BCT", "");

    const userId = pagamento.customer; // ou mapeamento via tabela compras_bct

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2️⃣ atualizar saldo
    await supabase.rpc("incrementar_saldo_bct", {
      p_user_id: userId,
      p_tokens: Number(tokens),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}