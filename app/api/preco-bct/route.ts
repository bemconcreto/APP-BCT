import { NextResponse } from "next/server";

const BASE_PRICE_USD = 0.50;

export async function GET() {
  try {
    // Buscar cotação USD/BRL
    const fx = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      cache: "no-store"
    });

    if (!fx.ok) {
      console.warn("Erro ao buscar dólar, usando fallback");
      return NextResponse.json({
        usd: BASE_PRICE_USD,
        brl: BASE_PRICE_USD * 5, // fallback
        variation24h: 0
      });
    }

    const json = await fx.json();

    if (!json?.USDBRL?.bid) {
      console.warn("Resposta inválida da API, usando fallback");
      return NextResponse.json({
        usd: BASE_PRICE_USD,
        brl: BASE_PRICE_USD * 5,
        variation24h: 0
      });
    }

    const usd = BASE_PRICE_USD;
    const brl = BASE_PRICE_USD * parseFloat(json.USDBRL.bid);

    // Simular variação (opcional)
    const variation = (Math.random() * 4 - 2).toFixed(2); // -2% a +2%

    return NextResponse.json({
      usd,
      brl,
      variation24h: variation
    });

  } catch (error) {
    console.error("Erro crítico na API:", error);

    return NextResponse.json({
      usd: BASE_PRICE_USD,
      brl: BASE_PRICE_USD * 5,
      variation24h: 0
    });
  }
}