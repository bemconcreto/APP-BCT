import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL, tokens, cpfCnpj, email } = body;

    // validação básica
    if (!nome || !numero || !mes || !ano || !cvv || !amountBRL) {
      return NextResponse.json({ success: false, error: "Dados do cartão incompletos." }, { status: 400 });
    }

    // supabase service client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // extrai token do header (opcional) para identificar user
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader || null;
    let userId: string | null = null;
    if (token) {
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }
    if (!userId && body.user_id) userId = body.user_id;

    if (!userId) {
      // se sua tabela exige NOT NULL em user_id, recuse aqui
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // registra compra pendente antes do cartão (opcional) — assim você tem registro mesmo se cartão falhar
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens: tokens ?? 0,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr || !compra) {
      console.log("ERRO AO REGISTRAR COMPRA (CARTAO):", compraErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar compra." }, { status: 500 });
    }

    // chama ASAAS para pagar com cartão
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
        description: `Compra de ${tokens ?? 0} BCT`,
        creditCard: {
          holderName: nome,
          number: numero,
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv, // alguns docs usam 'ccv' — se ASAAS pedir 'ccv' ou 'cvv' verifique (ajuste conforme resposta do ASAAS)
        },
        cpfCnpj,
        email,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.log("ASAAS CARTÃO ERRO:", data);
      // atualizar compra para failed se quiser
      await supabase.from("compras_bct").update({ status: "failed" }).eq("id", compra.id);
      return NextResponse.json({ success: false, error: data?.errors?.[0]?.description || "Falha ao processar cartão." }, { status: 400 });
    }

    // marcar como paid (ou dependendo do retorno do ASAAS, aguardar confirmação)
    await supabase.from("compras_bct").update({ status: "paid", payment_id: data.id }).eq("id", compra.id);

    return NextResponse.json({ success: true, id: data.id, raw: data });
  } catch (e) {
    console.error("ERRO CARTAO ROUTE:", e);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Cartão route ativa" });
}