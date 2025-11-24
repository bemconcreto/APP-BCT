import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    let userId: string | null = null;

    if (auth?.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.id) userId = data.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { nome, numero, mes, ano, cvv, amountBRL, tokens, cpfCnpj, email, phone } = body;

    // Criar compra
    const { data: compra } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    // Chamar ASAAS...
    // (mantem igual ao que já estava)

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro cartão:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}