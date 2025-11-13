import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.txid) {
      return NextResponse.json({ error: "TXID ausente" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Pagamento confirmado",
      status: "CONFIRMADO",
      txid: body.txid
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}