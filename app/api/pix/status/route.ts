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

    const resp = await fetch(`https://www.asaas.com/api/v3/payments/${id}`, {
      headers: {
        accept: "application/json",
        access_token: asaasKey,
      },
    });

    const dados = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: "Erro ao consultar Asaas" },
        { status: 500 }
      );
    }

    const copiaCola =
      dados.pixTransaction ??
      dados.bankSlip?.pix?.payload ??
      null;

    return NextResponse.json({
      success: true,
      copiaCola,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}