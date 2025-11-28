// app/api/extrato/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // Autenticação
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

    if (!userId)
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );

    // ================================
    // 1️⃣ BUSCAR COMPRAS
    // ================================
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("id, tokens, valor_recebido, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const comprasFmt = (compras || []).map((c) => ({
      id: c.id,
      tipo: "compra",
      tokens: Number(c.tokens),
      valor: Number(c.valor_recebido),
      data: c.created_at,
    }));

    // ================================
    // 2️⃣ BUSCAR VENDAS
    // ================================
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select(
        "id, tokens_solicitados, valor_liquido_brl, valor_brl, taxa_brl, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const vendasFmt = (vendas || []).map((v) => ({
      id: v.id,
      tipo: "venda",
      tokens: Number(v.tokens_solicitados),
      valor_bruto: Number(v.valor_brl),
      taxa: Number(v.taxa_brl),
      valor_liquido: Number(v.valor_liquido_brl),
      data: v.created_at,
    }));

    // ================================
    // 3️⃣ BUSCAR SAQUES
    // ================================
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("id, valor, chave_pix, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const saquesFmt = (saques || []).map((s) => ({
      id: s.id,
      tipo: "saque",
      valor: Number(s.valor),
      chave_pix: s.chave_pix,
      status: s.status,
      data: s.created_at,
    }));

    // ================================
    // 4️⃣ UNIFICAR EXTRATO
    // ================================
    const extrato = [
      ...comprasFmt,
      ...vendasFmt,
      ...saquesFmt,
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({
      success: true,
      extrato,
    });

  } catch (err) {
    console.error("❌ ERRO API EXTRATO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}