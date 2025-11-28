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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    /** BUSCA DAS 3 TABELAS **/

    // COMPRAS
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("id, tokens, valor_brl, status, created_at")
      .eq("user_id", userId);

    // VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("id, tokens_solicitados, valor_liquido_brl, status, created_at")
      .eq("user_id", userId);

    // SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("id, valor, status, created_at")
      .eq("user_id", userId);

    /** NORMALIZAÇÃO DOS ITENS **/

    const lista: any[] = [];

    compras?.forEach((c) =>
      lista.push({
        tipo: "compra",
        valor: Number(c.valor_brl),
        tokens: Number(c.tokens),
        status: c.status,
        data: c.created_at,
      })
    );

    vendas?.forEach((v) =>
      lista.push({
        tipo: "venda",
        valor: Number(v.valor_liquido_brl),
        tokens: Number(v.tokens_solicitados),
        status: v.status,
        data: v.created_at,
      })
    );

    saques?.forEach((s) =>
      lista.push({
        tipo: "saque",
        valor: Number(s.valor),
        tokens: null,
        status: s.status,
        data: s.created_at,
      })
    );

    /** ORDENAR MAIS RECENTE PRIMEIRO **/
    lista.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return NextResponse.json({ success: true, extrato: lista });
  } catch (err) {
    console.error("ERRO API EXTRATO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}