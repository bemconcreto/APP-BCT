import { NextResponse } from "next/server";

// 🔥 PREÇO BASE DO BCT EM USD (fixo do seu projeto)
const PRECO_BCT_USD = 0.4482;

export async function GET() {
  try {
    // 1️⃣ Buscar dólar em tempo real via nossa própria API
    const dolarReq = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dolar`, {
      cache: "no-store",
    });
    const dolarData = await dolarReq.json();

    // Se der erro, cai para o fallback
    const dolar =
      dolarData?.dolar || 5.60; // fallback para não quebrar o app

    // 2️⃣ Converte o BCT → BRL usando o dólar real
    const priceBRL = PRECO_BCT_USD * dolar;

    return NextResponse.json({
      success: true,
      usd: PRECO_BCT_USD,
      brl: Number(priceBRL.toFixed(4)),
      variation24h: 0, // podendo implementar mais tarde
    });

  } catch (err) {
    console.error("❌ ERRO /api/preco-bct:", err);

    // fallback se API cair
    return NextResponse.json({
      success: true,
      usd: PRECO_BCT_USD,
      brl: Number((PRECO_BCT_USD * 5.3).toFixed(4)),
      variation24h: 0,
    });
  }
}