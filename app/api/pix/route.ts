import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { amount, user_email } = body;

    if (!amount || !user_email) {
      return NextResponse.json(
        { error: "Missing amount or user_email" },
        { status: 400 }
      );
    }

    // conecta Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // cria registro do pagamento
    const { data, error } = await supabase
      .from("payments")
      .insert({
        amount,
        user_email,
        method: "PIX",
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json(
        { error: "Supabase insert failed" },
        { status: 500 }
      );
    }

    // retorna ao user os dados do PIX
    return NextResponse.json({
      success: true,
      payment_id: data.id,
      pix_key: process.env.PIX_KEY,
      pix_name: process.env.PIX_NAME,
      pix_type: process.env.PIX_TYPE,
      amount
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}