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

    // Página pública do Asaas
    const htmlRes = await fetch(`https://www.asaas.com/i/${id}`);
    const html = await htmlRes.text();

    // ====== EXTRAI QR CODE HIDDEN ======
    const qrMatch = html.match(/data-code="([^"]+)"/);
    const qrCode = qrMatch
      ? `https://pix.asaas.com/qr/${qrMatch[1]}`
      : null;

    // ====== EXTRAI PIX COPIA E COLA ======
    const copiaMatch = html.match(/copyPixCode\('([^']+)'\)/);
    const copiaCola = copiaMatch ? copiaMatch[1] : null;

    // ====== STATUS ======
    const statusMatch = html.match(/status-label[^>]*>([\s\S]*?)</);
    const status = statusMatch ? statusMatch[1].trim() : "Aguardando";

    return NextResponse.json({
      success: true,
      qrCode,
      copiaCola,
      status,
    });
  } catch (err) {
    console.error("STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    );
  }
}