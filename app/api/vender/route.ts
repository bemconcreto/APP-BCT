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
      return NextResponse.json({ success: false, error: "Quantidade inválida." }, { status: 400 });
    }

    // 🔐 autenticação
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData } = await sup.auth.getUser(token);
      userId = userData?.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // 🔍 1) Buscar saldo do usuário
    const { data: saldoRow, error: saldoErr } = await supabaseAdmin
      .from("wallet_saldos")
      .select("saldo_bct")
      .eq("user_id", userId)
      .single();

    if (saldoErr) {
      return NextResponse.json({ success: false, error: "Erro ao recuperar saldo." }, { status: 500 });
    }

    const saldoBCT = Number(saldoRow?.saldo_bct ?? 0);
    const tokensToSell = Number(tokens);

    if (tokensToSell > saldoBCT) {
      return NextResponse.json({ success: false, error: "Saldo insuficiente." }, { status: 400 });
    }

    // 🔥 TAXA = 10% aplicada no valor, NÃO nos tokens
    const FEE_PERCENT = 0.10;

    // 💲 2) Buscar preço do token
    let tokenPriceUSD = 0.4482;
    try {
      const precoRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? ""}/api/preco-bct`);
      if (precoRes.ok) {
        const precoJson = await precoRes.json();
        if (precoJson?.usd) tokenPriceUSD = Number(precoJson.usd);
      }
    } catch {}

    // 💵 3) Buscar dólar comercial
    let usdToBrl = 5.3;
    try {
      const resp = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const j = await resp.json();
      if (j?.USDBRL?.bid) usdToBrl = Number(j.USDBRL.bid);
    } catch {}

    // 💰 4) Calcular valor *bruto* e *líquido* (com taxa)
    const valorBrutoBRL = tokensToSell * tokenPriceUSD * usdToBrl;
    const valorLiquidoBRL = valorBrutoBRL * (1 - FEE_PERCENT);

    // 🧾 5) Registrar venda
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens_solicitados: tokensToSell,
        tokens_liquidos: tokensToSell, // agora tokens líquidos = tokens vendidos
        fee_percent: FEE_PERCENT,
        valor_brl: Number(valorLiquidoBRL.toFixed(2)),
        valor_bruto_brl: Number(valorBrutoBRL.toFixed(2)),
        usd_to_brl: usdToBrl,
        token_usd: tokenPriceUSD,
        status: "completed",
      })
      .select()
      .single();

    if (vendaErr) {
      console.error(vendaErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar venda." }, { status: 500 });
    }

    // 📉 6) Debitar saldo
    const newSaldo = Number((saldoBCT - tokensToSell).toFixed(6));

    const { error: updErr } = await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: newSaldo })
      .eq("user_id", userId);

    if (updErr) {
      return NextResponse.json({ success: false, error: "Erro ao atualizar saldo." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      venda_id: venda.id,
      tokens_vendidos: tokensToSell,
      valor_brl: Number(valorLiquidoBRL.toFixed(2)),
      novo_saldo_bct: newSaldo,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}