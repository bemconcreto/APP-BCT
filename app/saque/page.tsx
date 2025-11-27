"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

export default function SaquePage() {
  const [valor, setValor] = useState("");
  const [chave, setChave] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function solicitarSaque() {
    setMsg("");
    const v = Number(valor);

    if (!v || v <= 0) return setMsg("Digite um valor válido.");
    if (!chave) return setMsg("Digite sua chave PIX.");

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        setMsg("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/saque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor: v, chave_pix: chave }),
      });

      const json = await res.json();

      if (!json.success) {
        setMsg(json.error || "Erro ao solicitar saque.");
      } else {
        setMsg(`Saque solicitado! Valor: R$ ${v.toFixed(2)}.`);
        setValor("");
        setChave("");
      }
    } catch (e) {
      console.error(e);
      setMsg("Erro interno.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">Solicitar Saque</h1>

        {msg && <p className="text-center text-red-600 mb-4">{msg}</p>}

        <label className="font-semibold">Valor (R$)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          placeholder="Ex: 50.00"
        />

        <label className="font-semibold">Chave PIX</label>
        <input
          type="text"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-6"
          placeholder="Digite sua chave pix"
        />

        <button
          onClick={solicitarSaque}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg mb-6"
        >
          {loading ? "Enviando..." : "Confirmar Saque"}
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