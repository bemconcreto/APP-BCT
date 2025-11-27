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

    // Converter valor corretamente
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

    // Autenticação
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

    // Buscar saldo atual em wallet_cash
    const { data: walletRow } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_cash")
      .eq("user_id", userId)
      .single();

    const saldoAtual = Number(walletRow?.saldo_cash ?? 0);

    // Comparação CORRETA
    if (valorNumero > saldoAtual) {
      return NextResponse.json(
        { success: false, error: "Saldo insuficiente na carteira." },
        { status: 400 }
      );
    }

    // Debitar saldo
    const novoSaldo = Number((saldoAtual - valorNumero).toFixed(2));

    await supabaseAdmin
      .from("wallet_cash")
      .update({ saldo_cash: novoSaldo })
      .eq("user_id", userId);

    // Registrar solicitação de saque
    const { data: saque, error: saqueErr } = await supabaseAdmin
      .from("saques")
      .insert({
        user_id: userId,
        valor: valorNumero,
        chave_pix,
        status: "pending"
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
      novo_saldo: novoSaldo,
      saque_id: saque.id,
    });

  } catch (err) {
    console.error("ERRO API SAQUE:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}