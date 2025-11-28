// app/api/extrato/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // autenticação
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
      return NextResponse.json({ success: false, error: "Usuário não autenticado." }, { status: 401 });
    }

    // 1️⃣ COMPRAS
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("id, quantidade, valor_brl, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const comprasFormatadas =
      compras?.map((c) => ({
        tipo: "compra",
        descricao: `Compra de ${c.quantidade} BCT`,
        valor: -Number(c.valor_brl), // sai reais
        data: c.created_at,
      })) ?? [];

    // 2️⃣ VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("id, tokens_solicitados, valor_liquido_brl, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const vendasFormatadas =
      vendas?.map((v) => ({
        tipo: "venda",
        descricao: `Venda de ${v.tokens_solicitados} BCT`,
        valor: Number(v.valor_liquido_brl), // entra reais
        data: v.created_at,
      })) ?? [];

    // 3️⃣ SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("id, valor, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const saquesFormatados =
      saques?.map((s) => ({
        tipo: "saque",
        descricao: `Saque via PIX (${s.status})`,
        valor: -Number(s.valor), // saída de reais
        data: s.created_at,
      })) ?? [];

    // 4️⃣ CONSOLIDAR
    const extrato = [
      ...comprasFormatadas,
      ...vendasFormatadas,
      ...saquesFormatados,
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({ success: true, extrato });

  } catch (err) {
    console.error("ERRO /api/extrato:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}