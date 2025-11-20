import { NextResponse } from "next/server";
import { criarPagamentoAsaas } from "../../asaas/funcoes/criarPagamento";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { amountBRL, cpfCnpj, user_id, wallet } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // Preço fixo local (estava funcionando antes)
    const precoUSD = 0.4482;
    const dolar = 5.30;
    const precoBRL = precoUSD * dolar;

    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // Criar compra pendente
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
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 500 }
      );
    }

    const customerId = process.env.ASAAS_CUSTOMER_ID!;
    const descricao = `Compra de ${tokens} BCT`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const pagamento = await criarPagamentoAsaas({
      customerId,
      value: amountBRL,
      billingType: "PIX",
      description: descricao,
      dueDate: dueDate.toISOString().split("T")[0],
      cpfCnpj,
    });

    if (!pagamento.success || !pagamento.data?.id) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar PIX." },
        { status: 500 }
      );
    }

    // Atualiza id do pagamento
    await supabase
      .from("compras_bct")
      .update({ payment_id: pagamento.data.id })
      .eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: pagamento.data.id,
      qrCode: pagamento.data.pixQrCode,
      copiaCola: pagamento.data.pixCopiaECola,
    });

  } catch (err) {
    console.error("ERRO PIX:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}