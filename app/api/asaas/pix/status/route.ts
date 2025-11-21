import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não enviado" },
        { status: 400 }
      );
    }

    // Chama o ASAAS para consultar o pagamento
    const resposta = await fetch(
      `https://api.asaas.com/api/v3/payments/${id}/pixQrCode`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: process.env.ASAAS_API_KEY!,
        },
      }
    );

    const data = await resposta.json();

    if (!resposta.ok) {
      return NextResponse.json(
        { success: false, error: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      qrCode: data?.encodedImage ?? null,
      copiaCola: data?.payload ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}