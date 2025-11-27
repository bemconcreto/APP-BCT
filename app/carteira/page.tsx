"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function CarteiraPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadCarteira();
  }, []);

  async function loadCarteira() {
    setLoading(true);
    setMsg("");

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        setMsg("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/carteira", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.success) {
        setMsg("Erro ao carregar saldo.");
      } else {
        setSaldo(json.saldo_brl);
      }
    } catch {
      setMsg("Erro ao conectar com o servidor.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Minha Carteira</h1>

        {msg && <p className="text-red-600 mb-4">{msg}</p>}

        <div className="bg-gray-50 border rounded p-6 text-center mb-6">
          <h2 className="text-xl font-semibold">Saldo em Reais</h2>

          <p className="text-3xl font-bold mt-3">
            {saldo !== null ? `R$ ${saldo.toFixed(2)}` : "Carregando..."}
          </p>
        </div>

        <button
          onClick={loadCarteira}
          className="w-full bg-[#0C3D2E] text-white py-3 rounded-lg mb-4"
        >
          Atualizar
        </button>

        {/* 🔥 BOTÃO NOVO — SOLICITAR SAQUE */}
        <Link href="/saque">
          <span className="w-full block bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg mb-4 text-center cursor-pointer text-lg font-semibold">
            Solicitar Saque
          </span>
        </Link>

        <Link href="/">
          <span className="block text-center text-gray-600 underline cursor-pointer">
            Voltar ao painel
          </span>
        </Link>
      </div>
    </div>
  );
}