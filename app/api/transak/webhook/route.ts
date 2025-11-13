import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook Transak recebido:", body);

    const {
      status,
      id,
      cryptoAmount,
      walletAddress,
      fiatAmount,
      fiatCurrency,
      userId
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (status === "COMPLETED") {
      await supabase.from("payments").insert({
        user_id: userId || null,
        method: "TRANSAK",
        amount: fiatAmount,
        status: "approved",
        notes: `Compra via Transak. ID: ${id}`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Erro Webhook Transak:", err);
    return NextResponse.json(
      { error: err.message || "Erro inesperado" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";