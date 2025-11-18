import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API = process.env.ASAAS_API_KEY;

    const r = await fetch("https://api.asaas.com/v3/payments", {
      headers: { access_token: API! },
    });

    const data = await r.json();

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao consultar histórico" });
  }
}