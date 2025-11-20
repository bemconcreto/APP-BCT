import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../funcoes/criarPagamento";
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

    const body = await req.json();
    const { amountBRL, cpfCnpj, wallet, user_id } = body;

    if (!amountBRL || amountBRL <= 0) {
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

    if (!wallet || !user_id) {
      return NextResponse.json(
        { success: false, error: "Wallet e user_id são obrigatórios." },
        { status: 400 }
      );
    }

    // Conectar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 📌 Calcular tokens
    const precoUSD = Number(process.env.FALLBACK_BCT_USD || 0.50);
    const dolar = Number(process.env.FALLBACK_DOLAR || 5.30);
    const precoBRL = precoUSD * dolar;
    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // 📌 Criar compra "pending"
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
      console.error("Erro ao criar compra:", compraErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 500 }
      );
    }

    // 📌 dueDate obrigatório
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

    // 📌 Atualizar compra com payment_id
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