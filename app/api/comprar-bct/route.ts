import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { wallet, amount, method } = await req.json();

    if (!wallet || !amount || !method) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // Conecta no Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Salva registro no banco
    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_wallet: wallet,
        amount,
        payment_method: method,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao registrar pagamento." }, { status: 500 });
    }

    // 🔥 GERAR PIX AUTOMATICAMENTE (modo simples)
    if (method === "pix") {
      const qrCodeData = {
        chave: "742053f0-7437-4ec8-86af-48b2561f1999",
        tipo: "aleatoria",
        nome: "EPR EMPREENDIMENTOS IMOBILIÁRIOS",
        valor: Number(amount).toFixed(2),
        copia_cola: `00020126580014br.gov.bcb.pix0136742053f0-7437-4ec8-86af-48b2561f1999520400005303986540${Number(
          amount
        )
          .toFixed(2)
          .replace(".", "")}5802BR5925EPR EMPREENDIMENTOS IMOBILIÁRIOS6009SAO PAULO62070503***6304`
      };

      return NextResponse.json({
        ok: true,
        method: "pix",
        payment_id: data.id,
        pix: qrCodeData,
      });
    }

    // 🔥 CARTÃO (TRANSAK) — automático
    if (method === "card") {
      return NextResponse.json({
        ok: true,
        method: "card",
        transak_url: `https://global.transak.com?apiKey=${
          process.env.NEXT_PUBLIC_TRANSAK_API_KEY
        }&cryptoCurrencyCode=BCT&walletAddress=${wallet}&fiatAmount=${amount}`,
        payment_id: data.id,
      });
    }

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}