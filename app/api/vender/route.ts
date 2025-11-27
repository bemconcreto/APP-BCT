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

    // autenticação do usuário
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData } = await sup.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // pegar saldo atual
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

    // TAXA SOBRE O VALOR EM BRL
    const FEE_PERCENT = 0.10;

    // buscar preço do token em USD
    let tokenPriceUSD = 0.4482;
    try {
      const precoRes = await fetch(`https://app-bct.vercel.app/api/preco-bct`);
      if (precoRes.ok) {
        const precoJson = await precoRes.json();
        if (precoJson?.usd) tokenPriceUSD = Number(precoJson.usd);
      }
    } catch {}

    // buscar dólar comercial
    let usdToBrl = 5.3;
    try {
      const resp = await fetch(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL"
      );
      const j = await resp.json();
      const pair = j["USDBRL"];
      if (pair?.bid) usdToBrl = Number(pair.bid);
    } catch {}

    // valor total da venda
    const valorBRL = tokensToSell * tokenPriceUSD * usdToBrl;

    // desconta taxa sobre o valor
    const valorLiquido = valorBRL * (1 - FEE_PERCENT);

    // registra venda
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens_vendidos: tokensToSell,
        valor_brl: Number(valorLiquido.toFixed(2)),
        usd_to_brl: usdToBrl,
        token_usd: tokenPriceUSD,
        taxa_percent: FEE_PERCENT * 100,
        status: "completed",
      })
      .select()
      .single();

    if (vendaErr) {
      console.error("ERRO VENDA:", vendaErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar venda." },
        { status: 500 }
      );
    }

    // debitar tokens do saldo do cliente
    const newSaldo = Number((saldoBCT - tokensToSell).toFixed(6));

    const { error: updErr } = await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: newSaldo })
      .eq("user_id", userId);

    if (updErr) {
      console.error("ERRO SALDO:", updErr);
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar saldo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      venda_id: venda.id,
      tokens_vendidos: tokensToSell,
      valor_brl: Number(valorLiquido.toFixed(2)),
      novo_saldo_bct: newSaldo,
    });
  } catch (err) {
    console.error("ERRO GERAL:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}