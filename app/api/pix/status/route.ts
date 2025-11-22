import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Buscar dados do pagamento
    const base = await fetch(`https://www.asaas.com/api/v3/payments/${id}`, {
      headers: {
        accept: "application/json",
        access_token: key!,
      },
    }).then(r => r.json());

    // Buscar QR e copia/cola
    const pix = await fetch(
      `https://www.asaas.com/api/v3/payments/${id}/pixQrCode`,
      {
        headers: {
          accept: "application/json",
          access_token: key!,
        },
      }
    ).then(r => r.json());

    // Se estiver pago → atualizar saldo automaticamente
    if (base.status === "CONFIRMED") {

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1ª — pegar compra pelo payment_id
      const compra = await supabase
        .from("compras_bct")
        .select("*")
        .eq("payment_id", id)
        .single();

      if (compra.data) {
        const { user_id, tokens } = compra.data;

        // 2ª — pegar saldo atual
        const saldo = await supabase
          .from("wallet_saldos")
          .select("*")
          .eq("user_id", user_id)
          .single();

        let novoSaldo =
          (saldo.data?.saldo_bct || 0) + Number(tokens);

        // 3ª — atualizar saldo
        if (saldo.data) {
          await supabase
            .from("wallet_saldos")
            .update({ saldo_bct: novoSaldo })
            .eq("user_id", user_id);
        } else {
          await supabase
            .from("wallet_saldos")
            .insert({
              user_id,
              saldo_bct: novoSaldo,
            });
        }

        // 4ª — marcar compra como concluída
        await supabase
          .from("compras_bct")
          .update({ status: "paid" })
          .eq("payment_id", id);
      }
    }

    return NextResponse.json({
      success: true,
      status: base.status,               
      copiaCola: pix?.payload || null,
    });

  } catch (e) {
    console.error("STATUS ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Erro inesperado." },
      { status: 500 }
    );
  }
}