import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.uid || !body.quantidade) {
      return NextResponse.json({ error: "Dados insuficientes" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Tokens aprovados e liberados",
      uid: body.uid,
      quantidade: body.quantidade
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}