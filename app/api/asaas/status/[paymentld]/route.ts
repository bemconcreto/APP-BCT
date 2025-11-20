import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = context.params;

    const response = await fetch(
      `https://api.asaas.com/v3/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: process.env.ASAAS_API_KEY!,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erro ao consultar status ASAAS:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar status." },
      { status: 500 }
    );
  }
}