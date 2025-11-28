import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
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
        { success: false, error: "Não autorizado." },
        { status: 401 }
      );
    }

    // Extrato = Compras + Vendas + Saques
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("valor_brl, created_at")
      .eq("user_id", userId);

    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("valor_liquido_brl, created_at")
      .eq("user_id", userId);

    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("valor, created_at")
      .eq("user_id", userId);

    const extrato: any[] = [];

    compras?.forEach((c) =>
      extrato.push({
        tipo: "Compra",
        valor: c.valor_brl,
        created_at: c.created_at,
      })
    );

    vendas?.forEach((v) =>
      extrato.push({
        tipo: "Venda",
        valor: v.valor_liquido_brl,
        created_at: v.created_at,
      })
    );

    saques?.forEach((s) =>
      extrato.push({
        tipo: "Saque",
        valor: s.valor,
        created_at: s.created_at,
      })
    );

    extrato.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, extrato });
  } catch (err) {
    console.error("ERRO API EXTRATO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}