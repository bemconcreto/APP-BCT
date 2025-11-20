import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";
import { createClient } from "@supabase/supabase-js";

// =========================================================
//   🔥 FUNÇÃO PRINCIPAL DO PAGAMENTO COM CARTÃO
// =========================================================
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

    // 🔥 SUPABASE SERVICE ROLE
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { amountBRL, cpfCnpj, email, nome } = body;

    if (!amountBRL || Number(amountBRL) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    if (!cpfCnpj) {
      return NextResponse.json(
        { success: false, error: "CPF/CNPJ é obrigatório." },
        { status: 400 }
      );
    }

    // =====================================================
    //  🔥 Pegando o usuário logado via JWT da requisição
    // =====================================================
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token não encontrado. Faça login novamente." },
        { status: 401 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const user_id = user.id;
    const wallet = user.id; // usamos o user.id como "wallet" fixa

    // =====================================================
    //        🔥 CALCULAR TOKENS UTILIZANDO PREÇO LOCAL
    // =====================================================
    const precoUSD = Number(process.env.FALLBACK_BCT_USD || 0.50);
    const dolar = Number(process.env.FALLBACK_DOLAR || 5.30);
    const precoBRL = precoUSD * dolar;

    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // =====================================================
    //   🔥 Registrar compra pendente no Supabase
    // =====================================================
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id,
        wallet,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr || !compra) {
  console.error("❌ ERRO Supabase ao inserir compra:", compraErr);

  return NextResponse.json(
    {
      success: false,
      error: "Erro ao registrar compra.",
      detalhe: compraErr, // <-- AGORA O CELULAR VAI MOSTRAR O MOTIVO REAL
    },
    { status: 500 }
  );
}

    // =====================================================
    //        🔥 Criar pagamento ASAAS
    // =====================================================
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const description = `Compra de ${tokens} BCT (cartão)`;

    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "CREDIT_CARD",
      description,
      dueDate: dueDate.toISOString().split("T")[0],
      cpfCnpj,
    });

    if (!resultado.success || !resultado.data) {
      return NextResponse.json(
        { success: false, error: resultado.error ?? "Erro ao criar pagamento." },
        { status: 500 }
      );
    }

    // =====================================================
    //    🔥 Atualiza o registro da compra com payment_id
    // =====================================================
    await supabase
      .from("compras_bct")
      .update({ payment_id: resultado.data.id })
      .eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: resultado.data.id,
      status: resultado.data.status,
      invoiceUrl: resultado.data.invoiceUrl,
    });
  } catch (err) {
    console.error("ERRO BACKEND CARTAO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}