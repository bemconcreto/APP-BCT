export async function GET() {
  try {
    // Simular dados de preço do BCT
    // Em produção, isso viria de uma API real ou contrato
    const priceUSD = 0.48; // Preço em USD
    const usdBrlResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/usd`);
    const usdBrlData = await usdBrlResponse.json();
    
    const priceBRL = priceUSD * usdBrlData.usdbrl;
    
    // Simular variação 24h
    const variation24h = Math.random() * 10 - 5; // Entre -5% e +5%
    
    return Response.json({
      usd: priceUSD,
      brl: priceBRL,
      variation24h: variation24h,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar preço do BCT:', error);
    return Response.json({
      usd: 0.48,
      brl: 2.50,
      variation24h: 5.2,
      timestamp: new Date().toISOString(),
      error: 'Usando preços de fallback'
    });
  }
}