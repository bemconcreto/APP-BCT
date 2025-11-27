import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tokens } = body;

    if (!tokens || Number(tokens) <= 0) {
      return NextResponse.json({ success: false, error: "Quantidade inválida." });
    }

    // ---- PEGAR USUÁRIO ----
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Não autenticado." });
    }

    const token = auth.split(" ")[1];
    const supAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: userData } = await supAuth.auth.getUser(token);
    const userId = userData?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Usuário inválido." });
    }

    // ---- PEGAR SALDO DE TOKENS ----
    const { data: saldoRow } = await supabaseAdmin
      .from("wallet_saldos")
      .select("saldo_bct")
      .eq("user_id", userId)
      .single();

    const saldoBCT = Number(saldoRow?.saldo_bct ?? 0);
    const tokensToSell = Number(tokens);

    if (tokensToSell > saldoBCT) {
      return NextResponse.json({ success: false, error: "Saldo insuficiente." });
    }

    // ---- PREÇOS ----
    let tokenUSD = 0.4482;
    let usdToBrl = 5.30;

    // preço do token
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/preco-bct`);
      const j = await r.json();
      if (j?.usd) tokenUSD = Number(j.usd);
    } catch {}

    // dólar
    try {
      const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const j = await r.json();
      if (j?.USDBRL?.bid) usdToBrl = Number(j.USDBRL.bid);
    } catch {}

    // ---- CÁLCULO ----
    const valorRecebido = tokensToSell * tokenUSD * usdToBrl;
    const taxa = valorRecebido * 0.10;
    const valorLiquido = valorRecebido - taxa;

    // ---- REGISTRAR VENDA ----
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens: tokensToSell,
        valor_recebido: Number(valorRecebido.toFixed(2)),
        taxa: Number(taxa.toFixed(2)),
        valor_liquido: Number(valorLiquido.toFixed(2)),
        status: "completed"
      })
      .select()
      .single();

    if (vendaErr) {
      console.error("ERRO VENDA:", vendaErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar venda." });
    }

    // ---- DEBITAR TOKENS ----
    const novoSaldoBct = Number((saldoBCT - tokensToSell).toFixed(6));

    await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: novoSaldoBct })
      .eq("user_id", userId);

    // ---- CREDITAR CARTEIRA ----
    const { data: cashRow } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_brl")
      .eq("user_id", userId)
      .single();

    const saldoAtual = Number(cashRow?.saldo_brl ?? 0);
    const novoSaldoCash = Number((saldoAtual + valorLiquido).toFixed(2));

    await supabaseAdmin
      .from("wallet_cash")
      .upsert({ user_id: userId, saldo_brl: novoSaldoCash });

    return NextResponse.json({
      success: true,
      valor_liquido: Number(valorLiquido.toFixed(2)),
      novo_saldo_bct: novoSaldoBct,
      novo_saldo_cash: novoSaldoCash
    });

  } catch (err) {
    console.error("ERRO API:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}