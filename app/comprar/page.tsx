"use client";

// 🚫 Impede o Next.js de tentar fazer prerender desta página
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

function getSupabaseToken() {
  if (typeof window === "undefined") return null; // 👈 ESSENCIAL

  try {
    const raw = localStorage.getItem("supabase.auth.token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.currentSession?.access_token ?? null;
  } catch {
    return null;
  }
}

async function getUserSession() {
  return supabase.auth.getSession().then((res) => res.data.session);
}

export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  const [tokenPriceUSD] = useState(0.4482);
  const [usdToBrl] = useState(5.3);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const s = await getUserSession();
      setSession(s);
    }
    load();
  }, []);

  const amountUSD = amountBRL ? Number(amountBRL) / usdToBrl : 0;
  const tokens = amountUSD ? amountUSD / tokenPriceUSD : 0;
  const priceBRL = tokenPriceUSD * usdToBrl;

  async function pagarPix() {
    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const token = getSupabaseToken();
    if (!token) {
      alert("Você precisa estar logado para comprar.");
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
          amountBRL: Number(amountBRL),
          tokens: Number(tokens.toFixed(6)),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Erro ao gerar PIX: " + data.error);
        return;
      }

      window.location.href = data.pixUrl;
    } catch (err) {
      console.error(err);
      alert("Erro inesperado.");
    }

    setLoading(false);
  }

  async function pagarTransak() {
    alert("Pagamento via cartão Asaas ainda não configurado.");
  }

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
            placeholder="Ex: 100,00"
            value={amountBRL}
            onChange={(e) => setAmountBRL(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="bg-gray-50 border rounded-lg p-4 mb-8">
          <p className="text-gray-700">
            Preço do BCT: <strong>US$ {tokenPriceUSD.toFixed(4)}</strong>
          </p>
          <p className="text-gray-700">
            Dólar: <strong>R$ {usdToBrl.toFixed(2)}</strong>
          </p>
          <p className="text-gray-800 mt-2 text-lg font-semibold">
            Preço em BRL (por token): R$ {priceBRL.toFixed(4)}
          </p>
          <p className="text-gray-800 mt-1 text-lg font-semibold">
            Você receberá:{" "}
            <span className="text-green-800">{tokens.toFixed(6)} BCT</span>
          </p>
        </div>

        <p className="text-gray-600 text-center mb-8">
          Escolha a forma de pagamento
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={pagarTransak}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6"
          >
            Cartão
          </button>

          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6"
          >
            PIX
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