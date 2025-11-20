import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../../funcoes/criarPagamento";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const customerId = process.env.ASAAS_CUSTOMER_ID;

    if (!ASAAS_API_KEY || !customerId) {
      return NextResponse.json(
        { success: false, error: "Credenciais ASAAS ausentes." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amountBRL } = body;

    if (!amountBRL || Number(amountBRL) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // USER LOGADO
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token!);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // PREÇO LOCAL PARA CALCULAR TOKENS
    const precoUSD = Number(process.env.FALLBACK_BCT_USD || 0.50);
    const dolar = Number(process.env.FALLBACK_DOLAR || 5.30);
    const precoBRL = precoUSD * dolar;

    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // REGISTRA COMPRA (pendente)
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: user.id,
        wallet: user.id,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    // CRIA PIX ASAAS
    const resultado = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "PIX",
      description: `Compra de ${tokens} BCT (PIX)`,
      dueDate: dueDate.toISOString().split("T")[0],
      cpfCnpj: user.id,
    });

    // Salva o payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: resultado.data!.id })
      .eq("id", compra!.id);

    return NextResponse.json({
      success: true,
      id: resultado.data!.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}