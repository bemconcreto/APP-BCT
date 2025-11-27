"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function SaquePage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSaldo();
  }, []);

  async function loadSaldo() {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from("wallet_cash")
      .select("saldo_cash")
      .eq("user_id", user.id)
      .single();

    setSaldo(Number(data?.saldo_cash ?? 0));
  }

  async function solicitarSaque() {
    setMsg("");

    const valor = Number(amount);
    if (!valor || valor <= 0) return setMsg("Informe um valor válido.");
    if (saldo !== null && valor > saldo) return setMsg("Saldo insuficiente.");
    if (!pixKey) return setMsg("Informe a chave PIX.");

    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;

    const res = await fetch("/api/saque", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: valor, pix_key: pixKey }),
    });

    const j = await res.json();

    if (!j.success) {
      setMsg(j.error || "Erro ao solicitar saque.");
    } else {
      setMsg("Saque solicitado com sucesso! Aguardando aprovação.");
      loadSaldo();
      setAmount("");
      setPixKey("");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Solicitar Saque</h1>

        <p className="mb-4">
          Saldo disponível: R$ {saldo !== null ? saldo.toFixed(2) : "Carregando..."}
        </p>

        <label className="block mb-2">Valor do saque (R$)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block mb-2">Chave PIX</label>
        <input
          type="text"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        {msg && <p className="mb-4 text-red-600">{msg}</p>}

        <button
          onClick={solicitarSaque}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          {loading ? "Processando..." : "Solicitar Saque"}
        </button>

        <Link href="/carteira">
          <p className="text-center mt-4 underline cursor-pointer">Voltar</p>
        </Link>
      </div>
    </div>
  );
}