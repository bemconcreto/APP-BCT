import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não informado" },
        { status: 400 }
      );
    }

    // Consulta o pagamento no Asaas
    const resp = await fetch(`https://www.asaas.com/api/v3/payments/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
    });

    const dados = await resp.json();

    if (!resp.ok || dados.errors) {
      return NextResponse.json(
        { success: false, error: "Erro ao consultar status" },
        { status: 400 }
      );
    }

    // ❗ LEIA ISSO:
    // A rota GET /payments/{id} NÃO contém QR CODE nem COPIA E COLA
    // Portanto sempre será necessário retornar esses valores como NULL
    // Somente a rota de criação fornece o código PIX.

    return NextResponse.json({
      success: true,
      qrCode: dados.pixQrCodeImage ?? null,
      copiaCola: dados.pixTransaction ?? null,
      status: dados.status,
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}