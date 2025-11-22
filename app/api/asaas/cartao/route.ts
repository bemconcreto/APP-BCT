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

    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    if (!cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "CPF/CNPJ e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 👉 cria compra pendente
const { data: compra, error: compraErro } = await supabase
  .from("compras_bct")
  .insert({
    user_id: null,
    tokens,
    valor_pago: amountBRL,
    status: "pending",
  })
  .select()
  .single();

if (compraErro || !compra) {
  console.error("❌ ERRO AO CRIAR COMPRA NO SUPABASE:", compraErro);
  return NextResponse.json(
    { success: false, error: "Erro ao registrar compra." },
    { status: 500 }
  );
}
    // 👉 chamada Asaas
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "CREDIT_CARD",
        dueDate: new Date().toISOString().split("T")[0],
        value: amountBRL,
        description: `Compra de ${tokens} BCT`,
        externalReference: compra.id, //  <-- opcional, MAS MUITO BOM TER

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
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.log("Erro ASAAS:", data);
      return NextResponse.json(
        {
          success: false,
          error: data?.errors?.[0]?.description ?? "Erro no pagamento.",
        },
        { status: 400 }
      );
    }

    // 👉 SALVA APENAS payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("ERRO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}