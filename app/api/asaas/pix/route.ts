import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, cpfCnpj, tokens, email, nome } = body;

    // validação simples
    if (!amountBRL || Number(amountBRL) <= 0) {
      return NextResponse.json({ success: false, error: "Valor inválido." }, { status: 400 });
    }

    // cria client com SERVICE ROLE (server-side)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // pega Authorization Bearer token do header (se enviado)
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader || null;

    // tenta obter usuário a partir do token (segurança)
    let userId: string | null = null;
    if (token) {
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr) {
        console.log("⚠️ supabase.auth.getUser error:", userErr);
      } else {
        userId = userData?.user?.id ?? null;
      }
    }

    // se cliente não enviou token ou não conseguimos user, tentamos aceitar user_id vindo no body (fallback)
    if (!userId && body.user_id) {
      userId = body.user_id;
    }

    if (!userId) {
      // fail safe: não inserir compra sem user_id se tabela exige NOT NULL
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // cálculo tokens se não foi enviado
    const precoUSD = 0.4482;
    const dolar = 5.3;
    const precoBRL = precoUSD * dolar;
    const calculatedTokens = tokens ?? Number((Number(amountBRL) / precoBRL).toFixed(6));

    // registra compra pendente
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens: calculatedTokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr || !compra) {
      console.log("ERRO AO REGISTRAR COMPRA:", compraErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar compra." }, { status: 500 });
    }

    // chama Asaas para gerar PIX
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_TOKEN!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "PIX",
        value: amountBRL,
        description: `Compra de ${calculatedTokens} BCT`,
        dueDate: new Date().toISOString().split("T")[0],
        cpfCnpj,
        // opcional: email, externalReference etc
      }),
    });

    const pagamento = await resp.json();
    if (!resp.ok || !pagamento?.id) {
      console.log("ERRO PIX (ASAAS):", pagamento);
      return NextResponse.json({ success: false, error: "Erro ao gerar PIX." }, { status: 500 });
    }

    // atualiza compra com payment_id do Asaas
    await supabase.from("compras_bct").update({ payment_id: pagamento.id }).eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: pagamento.id,
      qrCode: pagamento.pixQrCode,
      copiaCola: pagamento.pixCopiaECola,
    });
  } catch (err) {
    console.error("ERRO PIX ROUTE:", err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "PIX route ativa" });
}