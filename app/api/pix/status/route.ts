// app/api/pix/status/route.ts
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

    const pagamentoResp = await fetch(
      `https://www.asaas.com/api/v3/payments/${id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          // incluir as duas formas para compatibilidade
          access_token: asaasKey,
          Authorization: `Bearer ${asaasKey}`,
        },
      }
    );

    // se a requisição falhar, devolver erro com corpo do ASAAS
    if (!pagamentoResp.ok) {
      const t = await pagamentoResp.text();
      return NextResponse.json(
        { success: false, error: "Erro no ASAAS: " + t },
        { status: pagamentoResp.status }
      );
    }

    const dados = await pagamentoResp.json();

    // se ASAAS devolveu errors
    if (dados?.errors) {
      return NextResponse.json(
        { success: false, error: dados.errors },
        { status: 400 }
      );
    }

    // Normalizar os campos possíveis que o ASAAS pode devolver:
    // - imagem do QR: pixQrCodeImage / pixQrCode / pix_qr_code_image / qrCode
    // - copia e cola: pixCopiaECola / pixTransaction / pix_copy_paste / copiaCola
    const qrCandidates = [
      dados.pixQrCodeImage,
      dados.pixQrCode,
      dados.pix_qr_code_image,
      dados.qrCode,
      dados.qr_code,
    ];

    const copyCandidates = [
      dados.pixCopiaECola,
      dados.pixTransaction,
      dados.pix_copy_paste,
      dados.copiaCola,
      dados.pixCopiaCola,
      dados.pix_copy_and_paste,
    ];

    const qrCode = qrCandidates.find(Boolean) ?? null;
    const copiaCola = copyCandidates.find(Boolean) ?? null;

    return NextResponse.json({
      success: true,
      // devolve os originais também para facilitar debugging front
      raw: dados,
      qrCode,
      copiaCola,
    });
  } catch (err: any) {
    console.error("ERROR /api/pix/status:", err);
    return NextResponse.json(
      { success: false, error: "Erro inesperado", detail: String(err) },
      { status: 500 }
    );
  }
}