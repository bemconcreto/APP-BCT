import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Preço fixo definido por você
    const priceUSD = 0.4482;

    // Conversão fixa com USD = R$5.30
    const usdToBrl = 5.30;

    const priceBRL = priceUSD * usdToBrl;

    // Variação pode ser fixa ou simulada — deixei fixa em +0.00%
    const variation24h = 0;

    return NextResponse.json({
      usd: priceUSD,
      brl: priceBRL,
      variation24h,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao calcular preço" },
      { status: 500 }
    );
  }
}