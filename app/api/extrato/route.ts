// app/api/extrato/route.ts
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
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 📌 Buscar compras
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("*")
      .eq("user_id", userId);

    // 📌 Buscar vendas
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("*")
      .eq("user_id", userId);

    // 📌 Buscar saques
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("*")
      .eq("user_id", userId);

    // 🔥 NORMALIZAR OS DADOS PARA FICAREM IGUAIS
    // Tipagem explícita
const lista: any[] = [];

    compras?.forEach((c) =>
      lista.push({
        tipo: "COMPRA",
        valor: Number(c.valor_brl ?? 0),
        tokens: Number(c.tokens ?? 0),
        status: c.status,
        data: c.created_at,
      })
    );

    vendas?.forEach((v) =>
      lista.push({
        tipo: "VENDA",
        valor: Number(v.valor_liquido_brl ?? 0),
        tokens: Number(v.tokens_solicitados ?? 0),
        status: v.status,
        data: v.created_at,
      })
    );

    saques?.forEach((s) =>
      lista.push({
        tipo: "SAQUE",
        valor: Number(s.valor ?? 0),
        tokens: null,
        status: s.status,
        data: s.created_at,
      })
    );

    // 🔥 Ordenar do mais recente para o mais antigo
    lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({ success: true, extrato: lista });

  } catch (err) {
    console.error("ERRO API EXTRATO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}