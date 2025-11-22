import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL, cpfCnpj, email } = body;

    // validação mínima
    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL || !cpfCnpj || !email) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    // supabase service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Identifica usuário logado
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

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

    // pegar customer do usuário
    const { data: wallet } = await supabase
      .from("wallet_saldos")
      .select("asaas_customer_id")
      .eq("user_id", userId)
      .single();

    if (!wallet?.asaas_customer_id) {
      return NextResponse.json(
        { success: false, error: "Customer ASAAS não encontrado." },
        { status: 400 }
      );
    }

    const customerId = wallet.asaas_customer_id;

    // criar cobrança cartão
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
        description: `Compra BCT`,
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
          postalCode: "00000000",
          addressNumber: "1"
        }
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.log("ERRO ASAAS:", data);
      return NextResponse.json(
        { success: false, error: data?.errors?.[0]?.description || "Falha no cartão." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, raw: data });

  } catch (e) {
    console.error("ERRO CARTAO:", e);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}