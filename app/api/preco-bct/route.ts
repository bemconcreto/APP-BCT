import { NextResponse } from "next/server";

// Preço base do BCT (você pode alterar)
const BASE_PRICE_USD = 0.50;

export async function GET() {
  try {
    // Gera variação leve automática: +3% / -3%
    const variation = (Math.random() * 6 - 3) / 100;
    const priceUSD = BASE_PRICE_USD * (1 + variation);

    // Buscar dólar comercial atualizado
    const usdAPI = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
    const usdJson = await usdAPI.json();
    const usdBRL = parseFloat(usdJson.USDBRL.bid);

    const priceBRL = priceUSD * usdBRL;

    return NextResponse.json({
      usd: priceUSD,
      brl: priceBRL,
      variation24h: variation * 100,
    });
  } catch (e) {
    console.error("Erro ao gerar preço mock:", e);
    return NextResponse.json({ usd: null, brl: null, variation24h: 0 });
  }
}