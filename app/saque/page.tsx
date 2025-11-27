"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function SaquePage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [valor, setValor] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadSaldo();
  }, []);

  async function loadSaldo() {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) return;

      const res = await fetch("/api/carteira", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.success) setSaldo(json.saldo_brl);
    } catch (e) {
      console.error(e);
    }
  }

  async function solicitarSaque() {
    setMsg("");

    const valorNumero = Number(valor);

    if (!valorNumero || valorNumero <= 0) {
      setMsg("Informe um valor válido.");
      return;
    }

    if (saldo === null || valorNumero > saldo) {
      setMsg("Saldo insuficiente na carteira.");
      return;
    }

    if (!chavePix || chavePix.length < 5) {
      setMsg("Informe uma chave PIX válida.");
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch("/api/saque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor: valorNumero,
          chave_pix: chavePix,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setMsg(json.error || "Erro ao solicitar saque.");
        return;
      }

      setMsg("Saque solicitado com sucesso!");
      setValor("");
      setChavePix("");
      setSaldo(json.novo_saldo);

    } catch (e) {
      console.error(e);
      setMsg("Erro ao enviar solicitação.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Solicitar Saque</h1>

        {msg && (
          <p className="text-center mb-4 text-red-600 font-semibold">{msg}</p>
        )}

        <label className="block font-semibold">Valor (R$)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4"
        />

        <label className="block font-semibold">Chave PIX</label>
        <input
          type="text"
          value={chavePix}
          onChange={(e) => setChavePix(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-6"
        />

        <button
          onClick={solicitarSaque}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg mb-4"
        >
          Confirmar Saque
        </button>

        <Link href="/carteira">
          <span className="block text-center text-gray-600 underline cursor-pointer">
            Voltar à carteira
          </span>
        </Link>
      </div>
    </div>
  );
}