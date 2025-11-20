// /app/api/asaas/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Webhook endpoint para receber notificações do Asaas.
 *
 * O fluxo:
 * 1) Recebe o webhook (Asaas envia um payload).
 * 2) Lê paymentId do body (ou payment.id).
 * 3) Consulta a API do Asaas para confirmar o status real do pagamento.
 * 4) Se o pagamento estiver confirmado/paid, grava a transação no Supabase e credita os BCT.
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
 * - ASAAS_API_KEY             -> (production) chave de API Asaas (access_token)
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY -> chave service_role do Supabase (usada no backend)
 *
 * Ajuste nomes de colunas/tabelas conforme seu schema (comentários mais abaixo).
 */

type AsaasPayment = {
  id?: string;
  status?: string;
  value?: number;
  customer?: string;
  pixTransaction?: { qrCode?: string; payload?: string } | null;
  invoiceUrl?: string | null;
  [k: string]: any;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ASAAS_API_KEY) {
  console.error("Webhook: env vars missing (SUPABASE or ASAAS).");
}

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Adapta aqui se o seu webhook vier com outro caminho até o id
    // Ex.: { event: 'PAYMENT_CONFIRMED', payment: { id: 'pay_123', ... } }
    const paymentId =
      body?.payment?.id ??
      body?.id ??
      body?.data?.payment?.id ??
      body?.paymentId ??
      body?.payment_id ??
      null;

    if (!paymentId) {
      console.warn("Webhook recebido sem payment id", { body });
      return NextResponse.json({ success: false, error: "payment id not found" }, { status: 400 });
    }

    // 1) Consulta o Asaas para validar o pagamento (garantia)
    const paymentRes = await fetch(`https://api.asaas.com/v3/payments/${paymentId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: ASAAS_API_KEY!,
      },
    });

    if (!paymentRes.ok) {
      const txt = await paymentRes.text();
      console.error("Erro consultando Asaas:", paymentRes.status, txt);
      return NextResponse.json({ success: false, error: "asaas lookup failed", detail: txt }, { status: 502 });
    }

    const payment: AsaasPayment = await paymentRes.json();

    // 2) Checar status plausível de pagamento confirmado
    // Ajuste a lista de statuses conforme o Asaas (alguns nomes: CONFIRMED, PAID, RECEIVED)
    const confirmedStatuses = ["CONFIRMED", "PAID", "RECEIVED", "CONFIRMED_AND_PAID"];
    const status = (payment.status || "").toUpperCase();

    if (!confirmedStatuses.includes(status)) {
      console.log("Pagamento não confirmado ainda — ignorando.", { paymentId, status });
      // Retorna 200 para que Asaas não reenvie interminavelmente (ou retorne 202 se preferir)
      return NextResponse.json({ success: false, message: "not confirmed", status }, { status: 200 });
    }

    // 3) Encontrar o usuário no Supabase — estratégia:
    //    a) Buscar pelo campo asaas_customer_id na tabela users
    //    b) Se não houver, tentar localizar por email (se payment.customer tiver email — alguns payloads tem)
    // Você deve garantir que, ao criar cliente no Asaas, você gravou o customerId no users. Aqui usamos customer id.
    const asaasCustomerId = payment.customer; // ex: "cus_000148981990"
    if (!asaasCustomerId) {
      console.warn("Payment confirmado sem customer id", { paymentId, payment });
      // prosseguimos, mas sem atrelamento de usuário não podemos creditar
      return NextResponse.json({ success: false, error: "payment missing customer id" }, { status: 200 });
    }

    // === MAPEAR USUÁRIO ===
    // Ajuste 'users' e 'asaas_customer_id' se no seu DB for outro nome
    const { data: usersFound, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id, email, bct_balance")
      .eq("asaas_customer_id", asaasCustomerId)
      .limit(1);

    if (userErr) {
      console.error("Erro ao buscar usuário no Supabase:", userErr);
      return NextResponse.json({ success: false, error: "db lookup error" }, { status: 500 });
    }

    if (!usersFound || usersFound.length === 0) {
      console.warn("Nenhum usuário encontrado para customerId:", asaasCustomerId);
      // opcional: você pode criar um registro de cliente "não mapeado" para auditoria
      await supabaseAdmin.from("payments").insert([
        {
          provider: "asaas",
          provider_payment_id: paymentId,
          amount: payment.value ?? null,
          status,
          raw_payload: payment,
          created_at: new Date().toISOString(),
          user_id: null,
        },
      ]);
      return NextResponse.json({ success: false, error: "user not found" }, { status: 200 });
    }

    const user = usersFound[0];

    // 4) Calcular tokens a creditar
    // -> Aqui usamos uma regra: tokens = (valorBRL / PRICE_USD) / USD_TO_BRL
    // Você pode substituir pela sua lógica de conversão.
    const PRICE_USD = Number(process.env.TOKEN_PRICE_USD ?? "0.4482"); // colocar em env se mudar
    const USD_TO_BRL = Number(process.env.USD_TO_BRL ?? "5.3"); // colocar em env se mudar

    const paidBRL = Number(payment.value ?? payment.amount ?? 0);
    const paidUSD = USD_TO_BRL > 0 ? paidBRL / USD_TO_BRL : 0;
    const tokensToCredit = PRICE_USD > 0 ? Number((paidUSD / PRICE_USD).toFixed(6)) : 0;

    // 5) Gravar transação e creditar saldo com transação atômica (aqui fazemos duas operações)
    // Ajuste tabelas/colunas conforme seu schema: 'payments' e 'users.bct_balance'
    const insertPayment = await supabaseAdmin.from("payments").insert([
      {
        user_id: user.id,
        provider: "asaas",
        provider_payment_id: paymentId,
        amount: paidBRL,
        tokens: tokensToCredit,
        status,
        raw_payload: payment,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertPayment.error) {
      console.error("Erro ao inserir pagamento:", insertPayment.error);
      return NextResponse.json({ success: false, error: "db insert error" }, { status: 500 });
    }

    // Atualizar saldo do usuário (cuidado com nomes de campos: bct_balance ou balance)
    const balanceField = "bct_balance"; // ajuste se seu campo se chama outro
    const newBalance = (Number(user[balanceField] ?? 0) + tokensToCredit);

    const updateUser = await supabaseAdmin
      .from("users")
      .update({ [balanceField]: newBalance })
      .eq("id", user.id);

    if (updateUser.error) {
      console.error("Erro ao atualizar saldo do usuário:", updateUser.error);
      // já registramos o pagamento; se quiser, podemos reverter inserção (não feito aqui)
      return NextResponse.json({ success: false, error: "update balance failed" }, { status: 500 });
    }

    // 6) Responder OK (200)
    console.log("Pagamento confirmado e tokens creditados:", { paymentId, userId: user.id, tokens: tokensToCredit });

    return NextResponse.json({ success: true, credited: tokensToCredit, userId: user.id });
  } catch (err) {
    console.error("Erro no webhook Asaas:", err);
    return NextResponse.json({ success: false, error: "internal error" }, { status: 500 });
  }
}