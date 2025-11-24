import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nome, numero, mes, ano, cvv,
      amountBRL, tokens,
      cpfCnpj, email, phone
    } = body;

    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL) {
      return NextResponse.json({ success: false, error: "Dados do cartão incompletos." }, { status: 400 });
    }

    if (!cpfCnpj || !email) {
      return NextResponse.json({ success: false, error: "CPF/CNPJ e e-mail são obrigatórios." }, { status: 400 });
    }

    // 1) CRIA COMPRA PENDENTE
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: null,
        tokens,
        valor_pago: amountBRL,
        status: "pending"
      })
      .select()
      .single();

    if (compraErr) {
      console.error("❌ ERRO AO INSERIR COMPRA:", compraErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar compra." }, { status: 400 });
    }

    // 2) ENVIA PARA O ASAAS
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
        dueDate: new Date().toISOString().split("T")[0],

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
    console.log("📌 RETORNO ASAAS:", data);

    // 3) VALIDAR STATUS REAL DO ASAAS
    if (!data.id || data.status === "FAILED") {
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha ao processar cartão." },
        { status: 400 }
      );
    }

    // Status válidos: RECEIVED, CONFIRMED, PAID, AUTHORIZED
    const aprovados = ["RECEIVED", "CONFIRMED", "PAID", "AUTHORIZED"];

    if (!aprovados.includes((data.status || "").toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Pagamento não aprovado pelo cartão." },
        { status: 400 }
      );
    }

    // 4) SALVA payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: data.id, status: "paid" })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });

  } catch (err) {
    console.error("❌ ERRO GERAL:", err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}