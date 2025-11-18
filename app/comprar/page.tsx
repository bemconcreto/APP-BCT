"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

// ----------- SAFE LOCALSTORAGE -------------
function getSupabaseToken() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("supabase.auth.token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    return (
      parsed.currentSession?.access_token ||
      parsed.access_token ||
      parsed.session?.access_token ||
      null
    );
  } catch {
    return null;
  }
}

// ----------- SAFE SESSION FETCH -------------
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
  const tokenPriceUSD = 0.4482;
  const usdToBrl = 5.3;
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // ----------- STATES DO CARTÃO -------------
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [ccv, setCcv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");

  useEffect(() => {
    async function loadSession() {
      if (typeof window !== "undefined") {
        const s = await getUserSessionSafe();
        setSession(s);
      }
    }
    loadSession();
  }, []);

  const amountUSD = amountBRL ? Number(amountBRL) / usdToBrl : 0;
  const tokens = amountUSD ? amountUSD / tokenPriceUSD : 0;
  const priceBRL = tokenPriceUSD * usdToBrl;

  // ---------- PIX ----------
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

      window.location.href = `/comprar/pix?pedido=${data.id}`;
    } catch (e) {
      console.error("ERRO PIX:", e);
      alert("Erro inesperado");
    }

    setLoading(false);
  }

  // ---------- CARTÃO (ASAAS) ----------
  async function pagarCartao() {
    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite o valor da compra.");
      return;
    }

    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !ccv || !cpfCnpj) {
      alert("Preencha todos os dados do cartão.");
      return;
    }

    const token = getSupabaseToken();
    if (!token) {
      alert("Você precisa estar logado para comprar.");
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
          amountBRL: Number(amountBRL),
          cardNumber,
          cardHolder,
          expiryMonth,
          expiryYear,
          ccv,
          cpfCnpj,
          tokens: Number(tokens.toFixed(6)),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Pagamento recusado: " + (data.error ?? "Erro desconhecido"));
        return;
      }

      alert("Pagamento aprovado!");
      window.location.href = `/comprar/sucesso?pedido=${data.paymentId}`;

    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao processar pagamento.");
    }

    setLoading(false);
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
            Você receberá: <span className="text-green-800">{tokens.toFixed(6)} BCT</span>
          </p>
        </div>

        <p className="text-gray-600 text-center mb-8">
          Escolha a forma de pagamento
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* CARTÃO */}
          <button
            onClick={() => setShowCardModal(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center"
          >
            <h2 className="text-xl font-semibold">Cartão (Asaas)</h2>
          </button>

          {/* PIX */}
          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center"
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

      {/* ----------- MODAL DO CARTÃO ----------- */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

            <h2 className="text-xl font-bold mb-4">Pagamento com Cartão</h2>

            <input
              type="text"
              placeholder="Nome impresso no cartão"
              className="w-full mb-3 p-3 border rounded"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />

            <input
              type="text"
              placeholder="Número do cartão"
              className="w-full mb-3 p-3 border rounded"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                placeholder="Mês (MM)"
                className="p-3 border rounded"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
              />

              <input
                type="text"
                placeholder="Ano (AA)"
                className="p-3 border rounded"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="CCV"
              className="w-full mb-3 p-3 border rounded"
              value={ccv}
              onChange={(e) => setCcv(e.target.value)}
            />

            <input
              type="text"
              placeholder="CPF ou CNPJ do titular"
              className="w-full mb-4 p-3 border rounded"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
            />

            <button
              onClick={pagarCartao}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded mb-3"
            >
              Pagar Agora
            </button>

            <button
              onClick={() => setShowCardModal(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded"
            >
              Cancelar
            </button>

          </div>
        </div>
      )}

    </div>
  );
}