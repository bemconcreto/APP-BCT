import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { wallet, amount } = body;

    if (!wallet || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Inicializar Supabase
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Criar registro no banco
    const { data, error } = await supabase
      .from("payments")
      .insert({
        wallet,
        amount,
        method: "pix",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting payment:", error);
      return NextResponse.json({ error: "Supabase insert failed" }, { status: 500 });
    }

    // PIX - sua chave aleatória
    const pixKey = "742053f0-7437-4ec8-86af-48b2561f1999";
    const pixName = "EPR EMPREENDIMENTOS IMOBILIÁRIOS";

    // Criar uma payload PIX copia e cola
    const pixCode = `
00020126330014BR.GOV.BCB.PIX0118${pixKey}520400005303986540${amount
      .toFixed(2)
      .replace(".", "")}5802BR5913${pixName}6009SaoPaulo62070503***6304`;

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      pixCode,
      pixKey,
      amount,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}