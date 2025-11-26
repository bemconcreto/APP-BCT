import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔥 1. Buscar dólar em tempo real
    const dolarResp = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/dolar`, {
      cache: "no-store",
    });
    const dolarData = await dolarResp.json();

    if (!dolarData.success) {
      return NextResponse.json(
        { success: false, error: "Falha ao carregar dólar." },
        { status: 500 }
      );
    }

    const dolar = Number(dolarData.dolar);

    // 🔥 2. Preço fixo original do token
    const precoUSD = 0.4482;

    // 🔥 3. Calcula em BRL usando dólar real
    const precoBRL = precoUSD * dolar;

    return NextResponse.json({
      success: true,
      usd: precoUSD,
      brl: precoBRL,
      variation24h: 0,
    });

  } catch (err) {
    console.error("❌ Erro no /api/preco-bct:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}