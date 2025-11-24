import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Cliente ADMIN
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cliente que lê a sessão do cookie
function supabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Cookie: cookies().toString() } }
    }
  );
}

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

    // 🔥 RECUPERA SESSÃO CORRETA
    const supabase = supabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 🔥 REGISTRAR COMPRA
    const { data: compra, error: errCompra } = await supabaseAdmin
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens,
        valor_pago: amountBRL,
        status: "pending"
      })
      .select()
      .single();

    if (errCompra) {
      console.error("Erro ao registrar compra:", errCompra);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 400 }
      );
    }

    // 🔥 CHAMAR ASAAS
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
        }
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Erro Asaas:", data);
      return NextResponse.json(
        { success: false, error: "Pagamento recusado." },
        { status: 400 }
      );
    }

    // 🔥 SALVAR payment_id
    await supabaseAdmin
      .from("compras_bct")
      .update({ payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id });

  } catch (e) {
    console.error("Erro interno:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}