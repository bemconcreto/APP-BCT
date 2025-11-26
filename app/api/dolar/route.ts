import { NextResponse } from "next/server";

// API de dólar gratuita (AwesomeAPI)
const API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";

export async function GET() {
  try {
    const resp = await fetch(API_URL, {
      cache: "no-store", // força sempre o valor mais atual
    });

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: "Erro ao consultar API do dólar." },
        { status: 500 }
      );
    }

    const data = await resp.json();

    const valor = Number(data?.USDBRL?.ask);

    if (!valor) {
      return NextResponse.json(
        { success: false, error: "Falha ao ler resposta da API." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dolar: valor,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Erro interno ao obter dólar." },
      { status: 500 }
    );
  }
}