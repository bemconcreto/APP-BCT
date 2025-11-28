// app/api/dolar/route.ts

export async function GET() {
  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      cache: "no-store"
    });

    const json = await res.json();
    const price = Number(json?.USDBRL?.bid ?? 5.30);

    return Response.json({ success: true, dolar: price });

  } catch (err) {
    console.error("ERRO API DÓLAR:", err);
    return Response.json({ success: false, dolar: 5.30 });
  }
}