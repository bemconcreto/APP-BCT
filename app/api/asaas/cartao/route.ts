import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const customerId = process.env.ASAAS_CUSTOMER_ID;

    if (!ASAAS_API_KEY || !customerId) {
      return NextResponse.json(
        { success: false, error: "Credenciais ASAAS ausentes." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      amountBRL,
      cpfCnpj,
      email,
      nome,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    } = body;

    // =======================
    // VALIDAR CAMPOS
    // =======================
    if (!amountBRL || Number(amountBRL) <= 0)
      return NextResponse.json({ success: false, error: "Valor inválido." });

    if (!cpfCnpj)
      return NextResponse.json({ success: false, error: "CPF/CNPJ é obrigatório." });

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !nome)
      return NextResponse.json({
        success: false,
        error: "Dados do cartão incompletos."
      });

    // =======================
    // PEGAR USER VIA TOKEN
    // =======================
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token)
      return NextResponse.json({
        success: false,
        error: "Token não encontrado."
      });

    const { data: auth } = await supabase.auth.getUser(token);

    if (!auth?.user)
      return NextResponse.json({
        success: false,
        error: "Usuário não autenticado."
      });

    const user_id = auth.user.id;
    const wallet = user_id;

    // =======================
    // CALCULAR TOKENS
    // =======================
    const precoUSD = Number(process.env.FALLBACK_BCT_USD || 0.50);
    const dolar = Number(process.env.FALLBACK_DOLAR || 5.30);
    const precoBRL = precoUSD * dolar;
    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // =======================
    // REGISTRAR COMPRA PENDENTE
    // =======================
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id,
        wallet,
        tokens,
        valor_pago: amountBRL,
        status: "pending"
      })
      .select()
      .single();

    if (compraErr || !compra) {
      console.error("❌ ERRO ao registrar compra:", compraErr);
      return NextResponse.json({
        success: false,
        error: "Erro ao registrar compra.",
        detalhe: compraErr
      });
    }

    // =======================
    // CRIAR PAGAMENTO ASAAS
    // =======================
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const payload = {
      customer: customerId,
      billingType: "CREDIT_CARD",
      value: amountBRL,
      description: `Compra de ${tokens} BCT`,
      dueDate: dueDate.toISOString().split("T")[0],

      creditCard: {
        holderName: nome,
        number: cardNumber,
        expiryMonth,
        expiryYear,
        ccv: cvv
      },

      creditCardHolderInfo: {
        name: nome,
        email: email,
        cpfCnpj: cpfCnpj,
      }
    };

    const resAsaas = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: ASAAS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const dataAsaas = await resAsaas.json();

    if (dataAsaas.errors) {
      console.error("❌ ERRO Asaas:", dataAsaas.errors);
      return NextResponse.json({
        success: false,
        error: dataAsaas.errors
      });
    }

    // SALVAR payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: dataAsaas.id })
      .eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: dataAsaas.id,
      status: dataAsaas.status
    });

  } catch (err) {
    console.error("ERRO BACKEND CARTÃO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}