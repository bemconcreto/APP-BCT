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
    const { amount, pix_key } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Valor inválido." });
    }
    if (!pix_key) {
      return NextResponse.json({ success: false, error: "Informe a chave PIX." });
    }

    // Autenticação
    const auth = req.headers.get("authorization") || "";
    let userId: string | null = null;

    if (auth.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      const sup = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await sup.auth.getUser(token);
      userId = data?.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "Usuário não autenticado." });
    }

    // Buscar saldo
    const { data: wallet } = await supabaseAdmin
      .from("wallet_cash")
      .select("saldo_cash")
      .eq("user_id", userId)
      .single();

    const saldoAtual = Number(wallet?.saldo_cash ?? 0);

    if (amount > saldoAtual) {
      return NextResponse.json({ success: false, error: "Saldo insuficiente." });
    }

    const novoSaldo = saldoAtual - amount;

    // Atualiza saldo
    await supabaseAdmin
      .from("wallet_cash")
      .update({ saldo_cash: novoSaldo })
      .eq("user_id", userId);

    // Registra o saque
    const { data: saque, error: saqueErr } = await supabaseAdmin
      .from("saques")
      .insert({
        user_id: userId,
        valor: amount,
        pix_key,
        status: "pending",
      })
      .select()
      .single();

    if (saqueErr) {
      return NextResponse.json({ success: false, error: "Erro ao registrar saque." });
    }

    return NextResponse.json({
      success: true,
      saque_id: saque.id,
      novo_saldo: novoSaldo,
    });

  } catch (err) {
    console.error("ERRO API SAQUE:", err);
    return NextResponse.json({ success: false, error: "Erro interno." });
  }
}