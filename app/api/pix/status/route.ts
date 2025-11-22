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

    // Consulta pagamento no ASAAS
    const pagamento = await fetch(
      `https://www.asaas.com/api/v3/payments/${id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: asaasKey,
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

    // 🔥 Só copia-e-cola (QR code removido)
    const copiaCola =
      dados.pixTransaction ??
      dados.bankSlip?.pix?.payload ??
      null;

    return NextResponse.json({
      success: true,
      status: dados.status ?? "PENDING",
      copiaCola,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}