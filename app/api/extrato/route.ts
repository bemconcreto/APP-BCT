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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 1️⃣ BUSCAR COMPRAS (corrigido)
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("id, tokens, valor_pago, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const comprasFormatadas =
      compras?.map((c) => ({
        tipo: "Compra",
        valor: Number(c.valor_pago ?? 0),
        info: `Token: ${c.tokens} BCT`,
        status: c.status,
        data: c.created_at,
      })) ?? [];

    // 2️⃣ BUSCAR VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("id, tokens, valor_recebido, valor_liquido, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const vendasFormatadas =
      vendas?.map((v) => ({
        tipo: "Venda",
        valor: Number(v.valor_recebido ?? v.valor_liquido ?? 0),
        info: `Token: ${v.tokens} BCT`,
        status: v.status,
        data: v.created_at,
      })) ?? [];

    // 3️⃣ BUSCAR SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("id, valor, chave_pix, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const saquesFormatados =
      saques?.map((s) => ({
        tipo: "Saque",
        valor: -Number(s.valor),
        status: s.status,
        data: s.created_at,
      })) ?? [];

    // 4️⃣ UNIR E ORDENAR
    const extrato = [
      ...comprasFormatadas,
      ...vendasFormatadas,
      ...saquesFormatados,
    ].sort(
      (a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return NextResponse.json({
      success: true,
      extrato,
    });
  } catch (err) {
    console.error("ERRO API EXTRATO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}