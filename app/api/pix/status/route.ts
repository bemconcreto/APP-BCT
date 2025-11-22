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

    const key = process.env.ASAAS_API_KEY;
    if (!key) {
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
          access_token: key,
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

    // 🔥 NOVO MAPEAMENTO CORRETO DO ASAAS
    const qrCode =
      dados.charge?.pixQrCode ??
      dados.billingTypeInfo?.pixQrCode ??
      null;

    const copiaCola =
      dados.charge?.pixCode ??
      dados.billingTypeInfo?.pixCode ??
      null;

    return NextResponse.json({
      success: true,
      qrCode,
      copiaCola,
      raw: dados,
    });
  } catch (err) {
    console.error("STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}