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
      cep,
      numeroCasa,
    } = body;

    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔹 Identificar usuário autenticado
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    let userId: string | null = null;

    if (token) {
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 🔹 Criar compra pendente
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens: tokens ?? 0,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    // 🔹 CRIAR CUSTOMER DINAMICAMENTE NO ASAAS
    const customerRes = await fetch("https://www.asaas.com/api/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: nome,
        cpfCnpj,
        email,
        phone,
      }),
    });

    const customerData = await customerRes.json();

    if (!customerRes.ok) {
      console.log("ERRO CUSTOMER ASAAS:", customerData);
      return NextResponse.json(
        { success: false, error: "Erro no cadastro ASAAS" },
        { status: 400 }
      );
    }

    const customerId = customerData.id;

    // 🔹 PAGAMENTO COM CARTÃO
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: customerId,
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
          postalCode: cep,
          addressNumber: numeroCasa,
          phone,
        },
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.log("ERRO CARTÃO ASAAS:", data);

      await supabase
        .from("compras_bct")
        .update({ status: "failed" })
        .eq("id", compra.id);

      return NextResponse.json(
        {
          success: false,
          error:
            data?.errors?.[0]?.description ||
            data?.description ||
            "Falha ao processar cartão.",
        },
        { status: 400 }
      );
    }

    // 🔹 Salva payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: data.id })
      .eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: data.id,
      raw: data,
    });
  } catch (e) {
    console.error("ERRO CARTAO ROUTE:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Cartão route ativa" });
}