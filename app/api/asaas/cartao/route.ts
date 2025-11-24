import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔥 Cliente ADMIN (igual ao PIX)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      phone
    } = body;

    // validações simples
    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    // 🔥 GRAVAR COMPRA COMO PENDENTE NO SUPABASE (SEM user_id)
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: null, // ⚠ igual ao pix!
        tokens,
        valor_pago: amountBRL,
        status: "pending"
      })
      .select()
      .single();

    if (compraErr) {
      console.error("❌ ERRO AO INSERIR COMPRA:", compraErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 400 }
      );
    }

    // 🔥 CHAMADA AO ASAAS
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
        dueDate: new Date().toISOString().split("T")[0],

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
          addressNumber: "1000",
          phone: phone || "11999999999",
        },
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.log("❌ ERRO ASAAS:", data);
      return NextResponse.json(
        {
          success: false,
          error: data?.errors?.[0]?.description ?? "Erro ao criar pagamento.",
        },
        { status: 400 }
      );
    }

    // 🔥 SALVAR payment_id no SUPABASE
    await supabase
      .from("compras_bct")
      .update({ payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });

  } catch (err) {
    console.error("❌ ERRO NO CARTÃO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}