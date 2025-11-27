// app/api/vender/route.ts
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
      return NextResponse.json(
        { success: false, error: "Quantidade inválida." },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await sup.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // BUSCA SALDO DO CLIENTE
    const { data: saldoRow } = await supabaseAdmin
      .from("wallet_saldos")
      .select("saldo_bct")
      .eq("user_id", userId)
      .single();

    const saldoBCT = Number(saldoRow?.saldo_bct ?? 0);
    const tokensToSell = Number(tokens);

    if (tokensToSell > saldoBCT) {
      return NextResponse.json(
        { success: false, error: "Saldo insuficiente." },
        { status: 400 }
      );
    }

    // PEGAR COTAÇÃO
    let tokenUSD = 0.4482;
    let usdToBrl = 5.30;

    try {
      const preco = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/preco-bct`);
      const j = await preco.json();
      if (j?.usd) tokenUSD = Number(j.usd);
    } catch {}

    try {
      const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const j = await r.json();
      if (j?.USDBRL?.bid) usdToBrl = Number(j.USDBRL.bid);
    } catch {}

    // CALCULAR VALORES
    const valorBRL = tokensToSell * tokenUSD * usdToBrl;
    const taxa = valorBRL * 0.10;
    const valorLiquido = valorBRL - taxa;

    // INSERIR VENDA USANDO SUA TABELA (estrutura atual)
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens: tokensToSell,
        valor_recebido: Number(valorBRL.toFixed(2)),
        taxa: Number(taxa.toFixed(2)),
        valor_liquido: Number(valorLiquido.toFixed(2)),
        status: "completed",
      })
      .select()
      .single();

    if (vendaErr) {
      console.error("ERRO AO INSERIR VENDA:", vendaErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar venda." },
        { status: 500 }
      );
    }

    // TIRAR TOKENS DA WALLET
    await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: saldoBCT - tokensToSell })
      .eq("user_id", userId);

    // CREDITAR CARTEIRA – AGORA FUNCIONA com saldo_cash
    const { data: wallet } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_brl")
      .eq("user_id", userId)
      .single();

    const saldoAtual = Number(wallet?.saldo_brl ?? 0);
    const novoSaldo = saldoAtual + valorLiquido;

    await supabaseAdmin
      .from("wallet_cash")
      .upsert({
        user_id: userId,
        saldo_brl: Number(novoSaldo.toFixed(2)),
      });

    return NextResponse.json({
      success: true,
      venda_id: venda.id,
      valor_recebido: Number(valorLiquido.toFixed(2)),
      novo_saldo_bct: saldoBCT - tokensToSell,
      novo_saldo_cash: Number(novoSaldo.toFixed(2)),
    });

  } catch (err) {
    console.error("ERRO ROUTE VENDER:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}