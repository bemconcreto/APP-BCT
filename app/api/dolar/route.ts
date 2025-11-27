import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url =
      "https://economia.awesomeapi.com.br/json/last/USD-BRL";

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Erro ao buscar dólar" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const valor = Number(data?.USDBRL?.bid);

    if (!valor || isNaN(valor)) {
      return NextResponse.json(
        { success: false, error: "Valor inválido retornado pela API" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dolar: valor,
    });
  } catch (e) {
    console.error("ERRO DÓLAR API:", e);
    return NextResponse.json(
      { success: false, error: "Falha interna" },
      { status: 500 }
    );
  }
}