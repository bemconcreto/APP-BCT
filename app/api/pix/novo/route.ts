import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const asaasKey = process.env.ASAAS_API_KEY!; // sua chave de produção

const supabase = createClient(supabaseUrl, supabaseKey);

// ================================
// POST /api/pix/novo
// ================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountBRL, tokens } = body;

    if (!amountBRL || amountBRL <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido" },
        { status: 400 }
      );
    }

    // -------------------------------
    // 1. Validar o usuário logado
    // -------------------------------
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData?.user) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Buscar registro na tabela users
    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!userRow) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado no banco" },
        { status: 404 }
      );
    }

    // ---------------------------------------
    // 2. Criar cliente ASAAS caso não exista
    // ---------------------------------------
    let customerId = userRow.asaas_customer_id;

    if (!customerId) {
      const createCustomer = await fetch("https://www.asaas.com/api/v3/customers", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          access_token: asaasKey,
        },
        body: JSON.stringify({
          name: userRow.email,
          email: userRow.email,
        }),
      }).then((r) => r.json());

      if (!createCustomer?.id) {
        return NextResponse.json(
          { success: false, error: "Erro ao criar cliente no ASAAS" },
          { status: 500 }
        );
      }

      customerId = createCustomer.id;

      await supabase
        .from("users")
        .update({ asaas_customer_id: customerId })
        .eq("id", userId);
    }

    // ---------------------------------------
    // 3. Criar cobrança PIX no ASAAS
    // ---------------------------------------
    const charge = await fetch("https://www.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        access_token: asaasKey,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: Number(amountBRL),
        description: `Compra de ${tokens} BCT`,
      }),
    }).then((r) => r.json());

    if (!charge?.id) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar cobrança PIX" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: charge.id,
      payload: charge,
    });
  } catch (error: any) {
    console.log("ERRO PIX:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}