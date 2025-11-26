import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resp = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: "Falha ao consultar API de câmbio." },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const dolarBRL = data.rates?.BRL || null;

    return NextResponse.json({
      success: true,
      dolar: dolarBRL,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Erro interno ao consultar dólar." },
      { status: 500 }
    );
  }
}