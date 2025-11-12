import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amountBRL, payerWallet } = await req.json();
  const qrCode = `FAKE-QR-${Math.random().toString(36).substring(7)}`;
  return NextResponse.json({ qrCode, amountBRL, payerWallet });
}
