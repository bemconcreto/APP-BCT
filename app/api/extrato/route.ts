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

    // 1️⃣ BUSCAR VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("id, valor_recebidc, valor_liquido, taxa, tokens, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const vendasFormatadas =
      vendas?.map((v) => ({
        tipo: "Venda de BCT",
        valor: Number(v.valor_recebidc ?? v.valor_liquido ?? 0),
        info: `Token: ${v.tokens} BCT`,
        status: v.status,
        data: v.created_at,
      })) ?? [];

    // 2️⃣ BUSCAR SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("id, valor, chave_pix, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const saquesFormatados =
      saques?.map((s) => ({
        tipo: "Saque",
        valor: -Number(s.valor),
        info: `Token: 0 BCT`,
        status: s.status,
        data: s.created_at,
      })) ?? [];

    // 3️⃣ UNIR E ORDENAR
    const extrato = [...vendasFormatadas, ...saquesFormatados].sort(
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