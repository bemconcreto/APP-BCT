import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || null;

    console.log("📥 BODY:", body);
    console.log("🔐 HEADER:", authHeader);

    const { nome, numero, mes, ano, cvv, amountBRL, tokens, cpfCnpj, email, phone } = body;

    if (!amountBRL || !nome || !numero || !mes || !ano || !cvv) {
      return NextResponse.json(
        { success: false, error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    // =====================================
    // 🔥 VALIDAR USUÁRIO VIA TOKEN (igual PIX)
    // =====================================
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

    if (!userId) {
      console.log("❌ Nenhum usuário autenticado");
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // ======================================
    // 🔥 REGISTRAR COMPRA
    // ======================================
    const { data: compra, error: compraErr } = await supabase
      .from("compras_bct")
      .insert({
        user_id: userId,
        tokens,
        valor_pago: amountBRL,
        status: "pending",
      })
      .select()
      .single();

    if (compraErr) {
      console.log("❌ ERRO AO INSERIR COMPRA:", compraErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar compra." },
        { status: 500 }
      );
    }

    // ======================================
    // 🔥 CRIAR PAGAMENTO NO ASAAS (cartão)
    // ======================================
    const resp = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: process.env.ASAAS_CUSTOMER_ID!,
        billingType: "CREDIT_CARD",
        value: amountBRL,
        description: `Compra de ${tokens} BCT`,
        dueDate: new Date().toISOString().split("T")[0],

        creditCard: {
          holderName: nome,
          number: numero,
          expiryMonth: mes,
          expiryYear: ano,
          ccv: cvv,
        },

        creditCardHolderInfo: {
          name: nome,
          email,
          cpfCnpj,
          postalCode: "00000000",
          addressNumber: "1000",
          phone: phone || "11999999999",
        },
      }),
    });

    const pagamento = await resp.json();

    if (!resp.ok || !pagamento.id) {
      console.log("❌ ERRO ASAAS CARTAO:", pagamento);
      return NextResponse.json(
        { success: false, error: "Erro ao processar cartão." },
        { status: 500 }
      );
    }

    // ======================================
    // 🔥 ATUALIZAR payment_id
    // ======================================
    await supabase
      .from("compras_bct")
      .update({ payment_id: pagamento.id })
      .eq("id", compra.id);

    return NextResponse.json({ success: true, id: pagamento.id });

  } catch (err) {
    console.error("❌ ERRO CARTAO:", err);
    return NextResponse.json({ success: false, error: "Erro interno." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Cartão route ativa" });
}