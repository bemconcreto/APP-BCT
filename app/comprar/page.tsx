import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const BCT_ADDRESS = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";

const ABI = [
  "function mint(address to, uint256 amount) external",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userWallet, amountTokens, paymentType } = body;

    if (!userWallet || !amountTokens) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // REGISTRA A COMPRA NO BANCO
    const { data, error } = await supabase
      .from("bct_compras")
      .insert({
        carteira_usuario: userWallet,
        quantidade: amountTokens,
        metodo: paymentType,
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      compraId: data.id,
      message: "Compra registrada. Aguardando pagamento.",
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}