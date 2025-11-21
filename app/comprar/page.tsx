"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

export const dynamic = "force-dynamic";

// TOKEN DO SUPABASE
async function getSupabaseToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// USUÁRIO LOGADO
async function getUserSession() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  const [user, setUser] = useState<any>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);

  const tokenPriceUSD = 0.4482;
  const usdToBrl = 5.3;

  // CARREGAR USUÁRIO
  useEffect(() => {
    getUserSession().then(setUser);
  }, []);

  // SIMULAÇÃO
  const amountUSD = amountBRL ? Number(amountBRL) / usdToBrl : 0;
  const tokens = amountUSD ? amountUSD / tokenPriceUSD : 0;

  // ==========================
  // 🚀 PAGAR PIX
  // ==========================
  async function pagarPix() {
    const token = await getSupabaseToken();
    if (!token) return alert("Faça login.");
    if (!cpfCnpj) return alert("Digite CPF/CNPJ.");
    if (!amountBRL || Number(amountBRL) <= 0) return alert("Valor inválido.");

    setLoading(true);

    const res = await fetch("/api/asaas/pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amountBRL: Number(amountBRL),
        tokens: Number(tokens.toFixed(6)),
        cpfCnpj,
        email: user?.email ?? "",
        nome: user?.user_metadata?.full_name ?? "Usuário",
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Erro ao gerar PIX: " + JSON.stringify(data.error));
      setLoading(false);
      return;
    }

    window.location.href = `/comprar/pix?pedido=${data.id}`;
  }

  // ==========================
  // 🚀 PAGAR CARTÃO
  // ==========================
  async function pagarCartao() {
    const token = await getSupabaseToken();
    if (!token) return alert("Faça login.");
    if (!cpfCnpj) return alert("Digite CPF/CNPJ.");
    if (!amountBRL || Number(amountBRL) <= 0) return alert("Valor inválido.");

    setLoading(true);

    const res = await fetch("/api/asaas/cartao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amountBRL: Number(amountBRL),
        tokens: Number(tokens.toFixed(4)),
        cpfCnpj,
        email: user?.email ?? "",
        nome: user?.user_metadata?.full_name ?? "Usuário",
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Erro ao gerar pagamento com cartão: " + JSON.stringify(data.error));
      setLoading(false);
      return;
    }

    window.location.href = `/comprar/cartao?pedido=${data.id}`;
  }

  // ==========================
  // UI
  // ==========================

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Comprar BCT
        </h1>

        {/* CPF/CNPJ */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            CPF ou CNPJ
          </label>
          <input
            type="text"
            placeholder="Digite seu CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        {/* Valor */}
        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            Valor (em Reais)
          </label>
          <input
            type="number"
            placeholder="Ex: 100,00"
            value={amountBRL}
            onChange={(e) => setAmountBRL(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        {/* Simulador */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-8">
          <p className="text-gray-700">
            Preço do BCT: <strong>US$ {tokenPriceUSD.toFixed(4)}</strong>
          </p>
          <p className="text-gray-700">
            Dólar: <strong>R$ {usdToBrl.toFixed(2)}</strong>
          </p>
          <p className="text-gray-800 mt-2 text-lg font-semibold">
            Você receberá:{" "}
            <span className="text-green-800">{tokens.toFixed(6)} BCT</span>
          </p>
        </div>

        {/* BOTÕES */}
        <p className="text-gray-600 text-center mb-8">
          Escolha a forma de pagamento
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={pagarCartao}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold">Cartão</h2>
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
              Voltar ao painel
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}