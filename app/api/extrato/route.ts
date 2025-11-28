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
      .select("*")
      .eq("user_id", userId);

    // 2️⃣ BUSCAR COMPRAS
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("*")
      .eq("user_id", userId);

    // 3️⃣ BUSCAR SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("*")
      .eq("user_id", userId);

    // 4️⃣ MONTAR UM EXTRATO ÚNICO
    const extrato: any[] = [];

    vendas?.forEach((v) =>
      extrato.push({
        tipo: "Venda",
        valor: Number(v.valor_liquido_brl),
        info: `${v.tokens_solicitados} BCT`,
        status: v.status,
        data: v.created_at,
      })
    );

    compras?.forEach((c) =>
      extrato.push({
        tipo: "Compra",
        valor: Number(c.valor_brl),
        info: `${c.tokens_recebidos} BCT`,
        status: c.status,
        data: c.created_at,
      })
    );

    saques?.forEach((s) =>
      extrato.push({
        tipo: "Saque",
        valor: Number(s.valor),
        info: s.chave_pix,
        status: s.status,
        data: s.created_at,
      })
    );

    // Ordenar por data (desc)
    extrato.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({
      success: true,
      extrato,
    });

  } catch (err) {
    console.error("ERRO EXTRATO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}