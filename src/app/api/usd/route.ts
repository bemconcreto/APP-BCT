export async function GET() {
  try {
    const response = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");
    const data = await response.json();
    
    return Response.json({ 
      usdbrl: data.rates.BRL || 5.20 
    });
  } catch (error) {
    console.error('Erro ao buscar cotação USD/BRL:', error);
    return Response.json({ 
      usdbrl: 5.20 // Fallback
    });
  }
}