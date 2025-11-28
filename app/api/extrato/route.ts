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
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    // 🔥 BUSCA VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 🔥 BUSCA COMPRAS
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 🔥 BUSCA SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      vendas,
      compras,
      saques
    });
  } catch (err) {
    console.error("ERRO EXTRATO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}