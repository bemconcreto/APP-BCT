"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

// =============================
//   TOKEN VIA LOCALSTORAGE
// =============================
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

// =============================
//   SESSION VIA SUPABASE
// =============================
async function getUserSessionSafe() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

// =============================
//         COMPONENTE
// =============================
export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const usd = 5.3;
  const priceUSD = 0.4482;
  const priceBRL = priceUSD * usd;

  const amountUSD = amountBRL ? Number(amountBRL) / usd : 0;
  const tokens = amountUSD / priceUSD || 0;

  // Carrega session ao abrir a página
  useEffect(() => {
    async function loadSession() {
      const s = await getUserSessionSafe();
      setSession(s);
    }
    loadSession();
  }, []);

  // =============================================================
  //                      VERIFICA LOGIN
  // =============================================================
  async function getAuthTokenOrRedirect() {
    const sessionObj = await getUserSessionSafe();
    const tokenSession = sessionObj?.access_token ?? null;
    const tokenStorage = getSupabaseToken();
    const token = tokenSession || tokenStorage;

    if (!token) {
      alert("Você precisa estar logado para comprar.");
      window.location.href = "/login"; // ou /cadastro
      return null;
    }

    return token;
  }

  // =============================================================
  //                         PAGAR PIX
  // =============================================================
  async function pagarPix() {
    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const token = await getAuthTokenOrRedirect();
    if (!token) return;

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
        setLoading(false);
        return;
      }

      window.location.href = `/comprar/pix?pedido=${data.id}`;
    } catch (err) {
      console.error("PIX erro:", err);
      alert("Erro inesperado ao gerar PIX.");
    }

    setLoading(false);
  }

  // =============================================================
  //                         PAGAR CARTÃO
  // =============================================================
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
      console.log("DETALHE:", data);
      return;
    }

    // 👉 Redireciona para o checkout do Asaas
    window.location.href = data.url;
  } catch (err) {
    console.error(err);
    alert("Erro inesperado no pagamento com cartão.");
  }

  setLoading(false);
}

  // =============================================================
  //                         TELA
  // =============================================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center mb-6">Comprar BCT</h1>

        {/* CAMPO INPUT */}
        <label className="block text-gray-700 font-semibold mb-2">
          Valor (em Reais)
        </label>
        <input
          type="number"
          placeholder="Ex: 100,00"
          value={amountBRL}
          onChange={(e) => setAmountBRL(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-6"
        />

        {/* SIMULADOR RESTAURADO */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-8">
          <p className="text-gray-700">
            Preço do BCT: <strong>US$ {priceUSD.toFixed(4)}</strong>
          </p>

          <p className="text-gray-700">
            Dólar: <strong>R$ {usd.toFixed(2)}</strong>
          </p>

          <p className="text-gray-800 mt-2 font-semibold">
            Preço em BRL (por token): R$ {priceBRL.toFixed(4)}
          </p>

          <p className="text-gray-800 mt-1 text-lg font-semibold">
            Você receberá:{" "}
            <span className="text-green-700">{tokens.toFixed(6)} BCT</span>
          </p>
        </div>

        {/* BOTÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={pagarCartao}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-lg font-semibold"
          >
            Cartão (Asaas)
          </button>

          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-lg font-semibold"
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