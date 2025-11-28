// app/api/saque/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { valor, chave_pix } = body;

    const valorNumero = Number(valor);

    if (!valorNumero || valorNumero <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor inválido." },
        { status: 400 }
      );
    }

    if (!chave_pix || chave_pix.length < 5) {
      return NextResponse.json(
        { success: false, error: "Chave PIX inválida." },
        { status: 400 }
      );
    }

    // ▶ AUTENTICAÇÃO
    const authHeader = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data } = await sup.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // 🟢 CALCULAR SALDO BASEADO EM COMPRAS + VENDAS - SAQUES
    // ----------------------------------------------------------

    // Total de COMPRAS confirmadas
    const { data: compras } = await supabaseAdmin
      .from("compras_bct")
      .select("valor_pago, status")
      .eq("user_id", userId)
      .eq("status", "completed");

    const totalCompras =
      compras?.reduce(
        (acc, item) => acc + Number(item.valor_pago ?? 0),
        0
      ) ?? 0;

    // Total de VENDAS confirmadas (USANDO SOMENTE valor_liquido)
    const { data: vendas } = await supabaseAdmin
      .from("vendas_bct")
      .select("valor_liquido, status")
      .eq("user_id", userId)
      .eq("status", "completed");

    const totalVendas =
      vendas?.reduce(
        (acc, item) => acc + Number(item.valor_liquido ?? 0),
        0
      ) ?? 0;

    // Total de SAQUES já realizados (exceto cancelados)
    const { data: saquesFeitos } = await supabaseAdmin
      .from("saques")
      .select("valor, status")
      .eq("user_id", userId)
      .neq("status", "canceled");

    const totalSaques =
      saquesFeitos?.reduce(
        (acc, item) => acc + Number(item.valor ?? 0),
        0
      ) ?? 0;

    // SALDO FINAL
    const saldoAtual = Number(totalCompras + totalVendas - totalSaques);

    // ----------------------------------------------------------
    // 🛑 VALIDAÇÃO DE SALDO
    // ----------------------------------------------------------
    if (valorNumero > saldoAtual) {
      return NextResponse.json(
        { success: false, error: "Saldo insuficiente na carteira." },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 🟡 REGISTRAR SAQUE
    // ----------------------------------------------------------
    const { data: saque, error: saqueErr } = await supabaseAdmin
      .from("saques")
      .insert({
        user_id: userId,
        valor: valorNumero,
        chave_pix,
        status: "pending",
      })
      .select()
      .single();

    if (saqueErr) {
      console.error("ERRO AO REGISTRAR SAQUE:", saqueErr);
      return NextResponse.json(
        { success: false, error: "Erro ao registrar saque." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      saque_id: saque.id,
      saldo_atualizado: saldoAtual - valorNumero,
    });

  } catch (err) {
    console.error("ERRO API SAQUE:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}