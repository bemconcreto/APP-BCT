import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || !tokens) {
      return NextResponse.json({ success: false, error: "Dados inválidos" });
    }

    // redireciona o usuário para a Transak
    return NextResponse.json({
      success: true,
      url: "https://global.transak.com",
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Erro interno" });
  }
}