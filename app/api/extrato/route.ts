// app/api/extrato/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // valida token Bearer e obtém user id
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Não autenticado." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const sup = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: userData, error: userErr } = await sup.auth.getUser(token);
    if (userErr || !userData?.user?.id) {
      console.error("erro validar user token:", userErr);
      return NextResponse.json({ success: false, error: "Usuário inválido." }, { status: 401 });
    }
    const userId = userData.user.id;

    // BUSCAR registros relevantes (cada consulta filtra pelo user_id)
    // (Adapte os nomes das colunas se a sua schema tiver outro nome)
    const [comprasRes, vendasRes, saquesRes, cashRes] = await Promise.all([
      supabaseAdmin
        .from("compras_bct")
        .select("id, tokens, valor_recebido, status, created_at")
        .eq("user_id", userId),
      supabaseAdmin
        .from("vendas_bct")
        .select("id, tokens_solicitados, tokens_liquidos, valor_brl, valor_liquido_brl, taxa_brl, status, created_at")
        .eq("user_id", userId),
      supabaseAdmin
        .from("saques")
        .select("id, valor, chave_pix, status, created_at")
        .eq("user_id", userId),
      supabaseAdmin
        .from("wallet_cash")
        .select("id, amount, source, reference_id, status, created_at")
        .eq("user_id", userId),
    ]);

    // checar erros simples
    if (comprasRes.error) console.warn("compras err:", comprasRes.error);
    if (vendasRes.error) console.warn("vendas err:", vendasRes.error);
    if (saquesRes.error) console.warn("saques err:", saquesRes.error);
    if (cashRes.error) console.warn("wallet_cash err:", cashRes.error);

    // normalizar registros em um único array
    const items: any[] = [];

    // compras
    if (Array.isArray(comprasRes.data)) {
      for (const c of comprasRes.data) {
        items.push({
          id: `compra_${c.id}`,
          kind: "compra",
          title: "Compra BCT",
          amount: Number(c.valor_recebido ?? 0),
          tokens: c.tokens ?? null,
          status: c.status ?? "unknown",
          meta: { raw: c },
          created_at: c.created_at,
        });
      }
    }

    // vendas
    if (Array.isArray(vendasRes.data)) {
      for (const v of vendasRes.data) {
        items.push({
          id: `venda_${v.id}`,
          kind: "venda",
          title: "Venda BCT",
          amount: Number(v.valor_liquido_brl ?? v.valor_brl ?? 0),
          tokens_requested: Number(v.tokens_solicitados ?? 0),
          tokens_net: Number(v.tokens_liquidos ?? 0),
          fee: Number(v.taxa_brl ?? 0),
          status: v.status ?? "unknown",
          meta: { raw: v },
          created_at: v.created_at,
        });
      }
    }

    // saques
    if (Array.isArray(saquesRes.data)) {
      for (const s of saquesRes.data) {
        items.push({
          id: `saque_${s.id}`,
          kind: "saque",
          title: "Saque solicitado",
          amount: Number(s.valor ?? 0),
          pix_key: s.chave_pix ?? null,
          status: s.status ?? "pending",
          meta: { raw: s },
          created_at: s.created_at,
        });
      }
    }

    // wallet_cash (entradas/ajustes)
    if (Array.isArray(cashRes.data)) {
      for (const w of cashRes.data) {
        items.push({
          id: `cash_${w.id}`,
          kind: "cash",
          title: w.source === "venda_bct" ? "Crédito venda" : (w.source ?? "Crédito"),
          amount: Number(w.amount ?? 0),
          source: w.source ?? null,
          reference_id: w.reference_id ?? null,
          status: w.status ?? "available",
          meta: { raw: w },
          created_at: w.created_at,
        });
      }
    }

    // ordenar por created_at decrescente
    items.sort((a, b) => {
      const da = new Date(a.created_at).getTime() || 0;
      const db = new Date(b.created_at).getTime() || 0;
      return db - da;
    });

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error("ERRO /api/extrato:", err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}