import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token ausente." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✔️ Validar usuário
    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // ✔️ Buscar extrato do usuário
    const { data: compras } = await supabase
      .from("compras_bct")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      compras,
    });
  } catch (err) {
    console.error("❌ ERRO EXTRATO:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}