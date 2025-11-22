import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nome,
      numero,
      mes,
      ano,
      cvv,
      amountBRL,
      tokens,
      cpfCnpj,
      email,
      phone,
    } = body;

    // validação forte somente NO CHECKOUT DO CARTÃO
    if (!nome || !numero || !mes || !ano || !cvv) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    if (!amountBRL || !cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "Dados obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // cria compra
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: null,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_TOKEN!,
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
          phone: phone || "11999999999",
        },
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.log("Erro ASAAS:", data);
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description },
        { status: 400 }
      );
    }

    await supabase
      .from("compras_bct")
      .update({ status: "paid", payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    console.error("ERRO CARTAO ROUTE:", e);
    return NextResponse.json({ success: false, error: "Erro interno" });
  }
}