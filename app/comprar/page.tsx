"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

// 🔒 Pega token do Supabase com segurança
function getSupabaseToken() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("supabase.auth.token");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return (
      parsed.currentSession?.access_token ||
      parsed.session?.access_token ||
      parsed.access_token ||
      null
    );
  } catch {
    return null;
  }
}

// 🔒 Pega sessão
async function getUserSessionSafe() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  
  // ✅ CORREÇÃO IMPORTANTE
  const [session, setSession] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const tokenPriceUSD = 0.4482;
  const usdToBrl = 5.3;

  useEffect(() => {
    async function loadSession() {
      const s = await getUserSessionSafe();
      setSession(s); // <-- AGORA ACEITO
    }
    loadSession();
  }, []);

  const amountUSD = amountBRL ? Number(amountBRL) / usdToBrl : 0;
  const tokens = amountUSD ? amountUSD / tokenPriceUSD : 0;

  // ==========================
  //        PAGAMENTO PIX
  // ==========================
  async function pagarPix() {
    const token = getSupabaseToken();

    if (!token) {
      alert("Você precisa estar logado para comprar!");
      return;
    }

    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/asaas/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amountBRL),
          tokens: Number(tokens.toFixed(4)),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Erro ao gerar PIX: " + data.error);
        return;
      }

      window.location.href = `/comprar/pix?pedido=${data.id}`;
    } catch (err) {
      console.error(err);
      alert("Erro inesperado no PIX");
    }

    setLoading(false);
  }

  // ==========================
  //   PAGAMENTO CARTÃO ASAAS
  // ==========================
  async function pagarCartao() {
    const token = getSupabaseToken();

    if (!token) {
      alert("Você precisa estar logado.");
      return;
    }

    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amountBRL),
          tokens: Number(tokens.toFixed(4)),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Erro ao gerar pagamento com cartão.");
        return;
      }

      window.location.href = `/comprar/cartao?pedido=${data.id}`;
    } catch (err) {
      console.error(err);
      alert("Erro inesperado no pagamento com cartão.");
    }

    setLoading(false);
  }

  // ---------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Comprar BCT
        </h1>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            Valor (em Reais)
          </label>
          <input
            type="number"
            value={amountBRL}
            onChange={(e) => setAmountBRL(e.target.value)}
            placeholder="Ex: 100,00"
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        <p className="text-gray-700 text-lg mb-6">
          Você receberá: <strong>{tokens.toFixed(4)} BCT</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={pagarCartao}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold">Cartão (Asaas)</h2>
          </button>

          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold">PIX</h2>
          </button>
        </div>

        <div className="text-center mt-8">
          <Link href="/">
            <span className="text-gray-600 underline cursor-pointer">
              Voltar ao Painel
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}