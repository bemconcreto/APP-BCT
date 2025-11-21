import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, cpfCnpj, user_id } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // === CÁLCULO ORIGINAL ===
    const precoUSD = 0.4482;
    const dolar = 5.30;
    const precoBRL = precoUSD * dolar;
    const tokens = Number((amountBRL / precoBRL).toFixed(6));

    // Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Registrar compra pendente
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr || !compra) {
      console.log("ERRO AO REGISTRAR COMPRA:", compraErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 500 }
      );
    }

    // ===== ASAAS PIX =====
    const response = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_TOKEN!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "PIX",
        value: amountBRL,
        description: `Compra de ${tokens} BCT`,
        dueDate: new Date().toISOString().split("T")[0],
        cpfCnpj,
      }),
    });

    const pagamento = await response.json();

    if (!response.ok || !pagamento?.id) {
      console.log("ERRO PIX:", pagamento);
      return NextResponse.json(
        { success: false, error: "Erro ao gerar PIX." },
        { status: 500 }
      );
    }

    // Atualizar compra com o payment_id
    await supabase
      .from("compras_bct")
      .update({ payment_id: pagamento.id })
      .eq("id", compra.id);

    return NextResponse.json({
      success: true,
      id: pagamento.id,
      qrCode: pagamento.pixQrCode,
      copiaCola: pagamento.pixCopiaECola,
    });
  } catch (error) {
    console.error("ERRO PIX:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}