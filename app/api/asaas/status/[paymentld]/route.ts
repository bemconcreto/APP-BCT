import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  const paymentId = params.paymentId;

  const res = await fetch(`https://api.asaas.com/v3/payments/${paymentId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      access_token: process.env.ASAAS_API_KEY!,
    },
  });

  const data = await res.json();

  return NextResponse.json({ status: data.status });
}