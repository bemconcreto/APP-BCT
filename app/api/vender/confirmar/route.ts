import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔐 CLIENTE ADMIN (permite escrever mesmo com RLS ativo)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { venda_id } = await req.json();

    if (!venda_id) {
      return NextResponse.json(
        { success: false, error: "ID da venda não enviado." },
        { status: 400 }
      );
    }

    // 1️⃣ BUSCA A VENDA
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .select("*")
      .eq("id", venda_id)
      .single();

    if (vendaErr || !venda) {
      return NextResponse.json(
        { success: false, error: "Venda não encontrada." },
        { status: 404 }
      );
    }

    if (venda.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Venda já foi processada." },
        { status: 400 }
      );
    }

    // 2️⃣ CALCULA O VALOR LÍQUIDO (aplica taxa de 10%)
    const taxa = 0.1;
    const valor_liquido = Number(venda.valor_brl) * (1 - taxa);

    // 3️⃣ BUSCA SALDO ATUAL DO USUÁRIO
    const { data: saldo, error: saldoErr } = await supabaseAdmin
      .from("wallet_saldos")
      .select("saldo_bct")
      .eq("user_id", venda.user_id)
      .single();

    if (saldoErr || !saldo) {
      return NextResponse.json(
        { success: false, error: "Saldo do usuário não encontrado." },
        { status: 400 }
      );
    }

    if (saldo.saldo_bct < venda.tokens) {
      return NextResponse.json(
        { success: false, error: "Saldo insuficiente para concluir a venda." },
        { status: 400 }
      );
    }

    // 4️⃣ DESCONTA OS TOKENS DO SALDO
    await supabaseAdmin
      .from("wallet_saldos")
      .update({
        saldo_bct: saldo.saldo_bct - venda.tokens,
      })
      .eq("user_id", venda.user_id);

    // 5️⃣ ATUALIZA VENDA PARA "paid"
    await supabaseAdmin
      .from("vendas_bct")
      .update({
        status: "paid",
        valor_liquido,
      })
      .eq("id", venda_id);

    return NextResponse.json({
      success: true,
      message: "Venda aprovada com sucesso.",
      valor_liquido,
    });
  } catch (e) {
    console.error("❌ ERRO AO CONFIRMAR VENDA:", e);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}