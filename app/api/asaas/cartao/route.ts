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
      cep,
      numeroEndereco,
      complemento,
      telefone
    } = body;

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

    // REGISTRA COMPRA PENDENTE
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: body.user_id,
        tokens: tokens ?? 0,
        valor_pago: amountBRL,
        status: "pending"
      })
      .select()
      .single();

    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!
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
          ccv: cvv
        },

        creditCardHolderInfo: {
          name: nome,
          email: email,
          cpfCnpj: cpfCnpj,
          postalCode: cep || "00000000",
          addressNumber: numeroEndereco || "0",
          addressComplement: complemento || "",
          mobilePhone: telefone || "00000000000"
        }
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      await supabase.from("compras_bct").update({ status: "failed" }).eq("id", compra.id);
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha ao processar cartão." },
        { status: 400 }
      );
    }

    await supabase
      .from("compras_bct")
      .update({ status: "paid", payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });

  } catch (e) {
    console.error("ERRO CARD:", e);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Cartão route ativa" });
}