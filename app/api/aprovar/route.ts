import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const BCT_ADDRESS = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";
const ABI = ["function mint(address to, uint256 amount) external"];

export async function POST(req: Request) {
  try {
    const { compraId } = await req.json();

    const { data: compra } = await supabase
      .from("bct_compras")
      .select("*")
      .eq("id", compraId)
      .single();

    if (!compra) return NextResponse.json({ error: "Compra não encontrada" });

    if (compra.status !== "pendente") {
      return NextResponse.json({ error: "Compra já processada" });
    }

    // FAZER O MINT REAL NA BLOCKCHAIN
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new ethers.Wallet(process.env.BCT_WALLET_ADMIN!, provider);
    const contract = new ethers.Contract(BCT_ADDRESS, ABI, wallet);

    const tx = await contract.mint(
      compra.carteira_usuario,
      ethers.parseUnits(compra.quantidade.toString(), 18)
    );

    await tx.wait();

    // ATUALIZA STATUS NO BANCO
    await supabase
      .from("bct_compras")
      .update({ status: "concluida", tx_hash: tx.hash })
      .eq("id", compraId);

    return NextResponse.json({
      success: true,
      message: "Tokens enviados com sucesso!",
      hash: tx.hash,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}