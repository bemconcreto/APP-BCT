import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // ==============================
    // LOG DETALHADO DO REQUEST
    // ==============================
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || null;

    console.log("📥 BODY RECEBIDO:", body);
    console.log("🔐 AUTH HEADER RECEBIDO:", authHeader);

    const { amountBRL, cpfCnpj, tokens } = body;

    if (!amountBRL || Number(amountBRL) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    // =========================================
    //      VALIDA USER VIA TOKEN (CORRETO)
    // =========================================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      const { data, error } = await supabase.auth.getUser(token);

      console.log("👤 RESULTADO getUser:", data, error);

      if (data?.user?.id) {
        userId = data.user.id;
      }
    }

    // Fallback caso front mande user_id
    if (!userId && body.user_id) {
      userId = body.user_id;
    }

    if (!userId) {
      console.log("❌ Nenhum user_id encontrado.");
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // =========================================
    //   CALCULA TOKENS
    // =========================================
    const precoUSD = 0.4482;
    const dolar = 5.3;
    const precoBRL = precoUSD * dolar;
    const calculatedTokens =
      tokens ?? Number((Number(amountBRL) / precoBRL).toFixed(6));

    // =========================================
    //   REGISTRA COMPRA (AQUI DAVA ERRO)
    // =========================================
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens: calculatedTokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr) {
      console.log("❌ ERRO AO REGISTRAR COMPRA:", compraErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 500 }
      );
    }

    // =========================================
    //   GERA PIX NO ASAAS
    // =========================================
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_TOKEN!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "PIX",
        value: amountBRL,
        description: `Compra de ${calculatedTokens} BCT`,
        dueDate: new Date().toISOString().split("T")[0],
        cpfCnpj,
      }),
    });

    const pagamento = await resp.json();

    if (!resp.ok || !pagamento.id) {
      console.log("❌ ERRO PIX ASAAS:", pagamento);
      return NextResponse.json(
        { success: false, error: "Erro ao gerar PIX." },
        { status: 500 }
      );
    }

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
  } catch (err) {
    console.error("❌ ERRO PIX ROUTE:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "PIX route ativa" });
}