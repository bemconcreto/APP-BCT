import { NextResponse } from "next/server";

const BASE_PRICE_USD = 0.50; // valor base provisório

export async function GET() {
  try {
    // Buscar dólar comercial
    const fx = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      cache: "no-store",
    });

    const fxJson = await fx.json();

    if (!fxJson?.USDBRL?.bid) {
      throw new Error("Erro ao buscar USD-BRL");
    }

    const usdBRL = parseFloat(fxJson.USDBRL.bid);

    // Simulação de variação (provisória)
    const variation = (Math.random() * 6 - 3) / 100;
    const priceUSD = BASE_PRICE_USD * (1 + variation);
    const priceBRL = priceUSD * usdBRL;

    return NextResponse.json({
      usd: Number(priceUSD.toFixed(6)),
      brl: Number(priceBRL.toFixed(6)),
      variation24h: Number((variation * 100).toFixed(2)),
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { usd: null, brl: null, variation24h: 0 },
      { status: 500 }
    );
  }
}