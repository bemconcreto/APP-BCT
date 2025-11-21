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

    const asaasKey = process.env.ASAAS_API_KEY;

    if (!asaasKey) {
      return NextResponse.json(
        { success: false, error: "API KEY ausente" },
        { status: 500 }
      );
    }

    const pagamento = await fetch(
      `https://www.asaas.com/api/v3/payments/${id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: process.env.ASAAS_API_KEY!,
        },
      }
    );

    const dados = await pagamento.json();

    if (dados.errors) {
      return NextResponse.json(
        { success: false, error: dados.errors },
        { status: 400 }
      );
    }

    // 👇 AS PARTES IMPORTANTES (ANTES ESTAVA ERRADO)
    const qrCode =
      dados.pixQrCodeImage ??
      dados.raw?.pixQrCodeImage ??
      dados.raw?.bankSlip?.pix?.encodedImage ??
      null;

    const copiaCola =
      dados.pixTransaction ??
      dados.raw?.pixTransaction ??
      dados.raw?.bankSlip?.pix?.payload ??
      null;

    return NextResponse.json({
      success: true,
      qrCode,
      copiaCola,
      raw: dados, // útil para debugar depois
    });
  } catch (err) {
    console.error("STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}