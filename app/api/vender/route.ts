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

    // -------------------------------------------------------
    // AUTENTICAÇÃO
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 1️⃣ BUSCAR SALDO DE TOKENS
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 2️⃣ BUSCAR PREÇOS
    // -------------------------------------------------------
    let tokenUSD = 0.4482;
    let usdToBrl = 5.30;

    // preço token
    try {
      const preco = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/preco-bct`);
      if (preco.ok) {
        const j = await preco.json();
        if (j?.usd) tokenUSD = Number(j.usd);
      }
    } catch {}

    // dólar
    try {
      const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const j = await res.json();
      if (j?.USDBRL?.bid) usdToBrl = Number(j.USDBRL.bid);
    } catch {}

    // -------------------------------------------------------
    // 3️⃣ CÁLCULO FINANCEIRO
    // -------------------------------------------------------
    const valorBRL = tokensToSell * tokenUSD * usdToBrl;
    const taxa = valorBRL * 0.1;
    const valorLiquido = valorBRL - taxa;

    // -------------------------------------------------------
    // 4️⃣ REGISTRAR VENDA
    // -------------------------------------------------------
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens_solicitados: tokensToSell,
        valor_brl: Number(valorBRL.toFixed(2)),
        taxa_brl: Number(taxa.toFixed(2)),
        valor_liquido_brl: Number(valorLiquido.toFixed(2)),
        token_usd: tokenUSD,
        usd_to_brl: usdToBrl,
        status: "completed",
      })
      .select()
      .single();

    if (vendaErr) {
      console.error("ERRO AO INSERIR VENDA:", vendaErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar venda." });
    }

    // -------------------------------------------------------
    // 5️⃣ DEBITAR TOKENS
    // -------------------------------------------------------
    await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: saldoBCT - tokensToSell })
      .eq("user_id", userId);

    // -------------------------------------------------------
    // 6️⃣ CREDITAR REAIS NA WALLET_CASH (campo correto: saldo_brl)
    // -------------------------------------------------------
    const { data: cashRow } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_brl")
      .eq("user_id", userId)
      .single();

    const saldoAtual = Number(cashRow?.saldo_brl ?? 0);
    const novoSaldo = saldoAtual + valorLiquido;

    await supabaseAdmin
      .from("wallet_cash")
      .upsert({
        user_id: userId,
        saldo_brl: Number(novoSaldo.toFixed(2)),
      });

    // -------------------------------------------------------
    // 7️⃣ RETORNO AO FRONT
    // -------------------------------------------------------
    return NextResponse.json({
      success: true,
      venda_id: venda.id,
      valor_brl: Number(valorLiquido.toFixed(2)),
      novo_saldo_bct: Number((saldoBCT - tokensToSell).toFixed(6)),
      novo_saldo_cash: Number(novoSaldo.toFixed(2)),
    });

  } catch (err) {
    console.error("ERRO ROUTE VENDER:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}