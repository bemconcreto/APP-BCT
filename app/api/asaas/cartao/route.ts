import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL, tokens, cpfCnpj, email } = body;

    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL || !cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔐 valida usuário pelo token enviado no header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    let userId = null;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      userId = data?.user?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // 🔹 registra a compra pendente
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    // 🔹 chama ASAAS
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "CREDIT_CARD",
        value: amountBRL,
        description: `Compra de ${tokens} BCT`,
        creditCard: {
          holderName: nome,
          number: numero,
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv,
        },
        creditCardHolderInfo: {
          name: nome,
          email,
          cpfCnpj,
          postalCode: "00000000",
          addressNumber: "0",
          phone: "11999999999"
        },
        remoteIp: "0.0.0.0"
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      await supabase.from("compras_bct").update({ status: "failed" }).eq("id", compra.id);
      return NextResponse.json({ success: false, error: data?.errors?.[0]?.description }, { status: 400 });
    }

    // sucesso! atualizar compra
    await supabase
      .from("compras_bct")
      .update({ status: "paid", payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, raw: data });

  } catch (e) {
    console.error("ERRO CARTAO:", e);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ ok: true });
}