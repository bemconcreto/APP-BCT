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
    const { tokens } = body; // tokens a vender (number)

    if (!tokens || Number(tokens) <= 0) {
      return NextResponse.json({ success: false, error: "Quantidade inválida." }, { status: 400 });
    }

    // pegar token de auth (Bearer ...)
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // usar client com service role para validar o token
      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData, error: userErr } = await sup.auth.getUser(token);
      if (userErr) {
        console.error("erro ao validar token:", userErr);
      }
      if (userData?.user?.id) userId = userData.user.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // ✅ 1) Verificar saldo em wallet_saldos
    const { data: saldoRow, error: saldoErr } = await supabaseAdmin
      .from("wallet_saldos")
      .select("saldo_bct")
      .eq("user_id", userId)
      .single();

    if (saldoErr) {
      console.error("erro ao buscar saldo:", saldoErr);
      return NextResponse.json({ success: false, error: "Erro ao recuperar saldo." }, { status: 500 });
    }

    const saldoBCT = Number(saldoRow?.saldo_bct ?? 0);
    const tokensToSell = Number(tokens);

    if (tokensToSell > saldoBCT) {
      return NextResponse.json({ success: false, error: "Saldo insuficiente." }, { status: 400 });
    }

    // ✅ 2) Calcular taxa (10%) e tokens líquidos
    const FEE_PERCENT = 0.10;
    const tokensAfterFee = tokensToSell * (1 - FEE_PERCENT);

    // ✅ 3) Pegar preço do token (USD) e câmbio USD->BRL (consulta pública)
    // Preço do token em USD (se você tem endpoint interno para preço use-o, aqui usamos fallback)
    let tokenPriceUSD = 0.4482; // fallback
    try {
      // tenta buscar preço do token
      const precoRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? ""}/api/preco-bct`);
      if (precoRes.ok) {
        const precoJson = await precoRes.json();
        if (precoJson?.usd) tokenPriceUSD = Number(precoJson.usd);
      }
    } catch (e) {
      // ignora, usa fallback
      console.warn("não foi possível obter /api/preco-bct no server, usando fallback:", e);
    }

    // buscar dólar comercial (API pública)
    let usdToBrl = 5.3;
    try {
      const resp = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const j = await resp.json();
      const pair = j["USDBRL"];
      if (pair && pair.bid) usdToBrl = Number(pair.bid);
    } catch (e) {
      console.warn("Erro buscando USD-BRL, usando fallback:", e);
    }

    // ✅ 4) Calcular valor em BRL que será creditado ao usuário
    const valorBRL = tokensAfterFee * tokenPriceUSD * usdToBrl;

    // ✅ 5) Atualizar DB: criar venda e debitar saldo (usar transaction-like sequence)
    // Criar registro em vendas (tabela: vendas_bct) — se não existir, adapte o nome da tabela
    const { data: venda, error: vendaErr } = await supabaseAdmin
      .from("vendas_bct")
      .insert({
        user_id: userId,
        tokens_solicitados: tokensToSell,
        tokens_liquidos: tokensAfterFee,
        fee_percent: FEE_PERCENT,
        valor_brl: Number(valorBRL.toFixed(2)),
        usd_to_brl: usdToBrl,
        token_usd: tokenPriceUSD,
        status: "completed",
      })
      .select()
      .single();

    if (vendaErr) {
      console.error("❌ ERRO AO INSERIR VENDA:", vendaErr);
      return NextResponse.json({ success: false, error: "Erro ao registrar venda." }, { status: 500 });
    }

    // ✅ 6) Debitar saldo na wallet_saldos
    const newSaldo = Number((saldoBCT - tokensToSell).toFixed(6));
    const { error: updErr } = await supabaseAdmin
      .from("wallet_saldos")
      .update({ saldo_bct: newSaldo })
      .eq("user_id", userId);

    if (updErr) {
      console.error("❌ ERRO AO ATUALIZAR SALDO:", updErr);
      // nota: aqui idealmente reverter a venda, mas retornamos erro
      return NextResponse.json({ success: false, error: "Erro ao atualizar saldo." }, { status: 500 });
    }

    // ✅ 7) Opcional: registrar pagamento/entrada financeira em outra tabela payments (omito)

    return NextResponse.json({
      success: true,
      venda_id: venda.id,
      tokens_solicitados: tokensToSell,
      tokens_liquidos: Number(tokensAfterFee.toFixed(6)),
      valor_brl: Number(valorBRL.toFixed(2)),
      novo_saldo_bct: newSaldo,
    });
  } catch (err) {
    console.error("❌ ERRO ROUTE VENDER:", err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}