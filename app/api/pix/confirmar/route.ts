import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    const body = await req.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json({ error: "payment_id obrigatório" }, { status: 400 });
    }

    // Atualiza pagamento para confirmado
    await supabase
      .from("payments")
      .update({ status: "confirmed" })
      .eq("id", payment_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro confirmar pix:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}