// app/api/carteira/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer "))
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

    const token = auth.split(" ")[1];

    const sup = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await sup.auth.getUser(token);
    const userId = userData?.user?.id;

    if (!userId)
      return NextResponse.json({ success: false, error: "Usuário não autenticado" }, { status: 401 });

    // ▶ COMPRAS
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("valor_pago, status")
      .eq("user_id", userId)
      .eq("status", "completed");

    const totalCompras =
      compras?.reduce(
        (acc, item) => acc + Number(item.valor_pago ?? 0),
        0
      ) ?? 0;

    // ▶ VENDAS
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("valor_liquido, status")
      .eq("user_id", userId)
      .eq("status", "completed");

    const totalVendas =
      vendas?.reduce(
        (acc, item) => acc + Number(item.valor_liquido ?? 0),
        0
      ) ?? 0;

    // ▶ SAQUES
    const { data: saques } = await supabaseAdmin
      .from("saques")
      .select("valor, status")
      .eq("user_id", userId)
      .neq("status", "canceled");

    const totalSaques =
      saques?.reduce(
        (acc, item) => acc + Number(item.valor ?? 0),
        0
      ) ?? 0;

    // ▶ SALDO FINAL
    const saldo = Number(totalCompras + totalVendas - totalSaques);

    return NextResponse.json({
      success: true,
      saldo,
    });

  } catch (err) {
    console.error("ERRO API CARTEIRA:", err);
    return NextResponse.json({ success: false, error: "Erro interno" });
  }
}