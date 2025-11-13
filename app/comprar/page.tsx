"use client";

import { useState } from "react";
import Link from "next/link";

export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  const [tokenPriceUSD] = useState(0.4482);
  const [usdToBrl] = useState(5.3);
  const [loading, setLoading] = useState(false);

  // conversões
  const amountUSD = amountBRL ? Number(amountBRL) / usdToBrl : 0;
  const tokens = amountUSD ? amountUSD / tokenPriceUSD : 0;
  const priceBRL = tokenPriceUSD * usdToBrl;

  // -----------------------------
  //  PIX
  // -----------------------------
  async function pagarPix() {
    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const token = localStorage.getItem("sb-access-token");
    if (!token) {
      alert("Você precisa estar logado para comprar.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pix/novo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountBRL: Number(amountBRL),
          tokens,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Erro ao gerar PIX");
        return;
      }

      window.location.href = `/comprar/pix?pedido=${data.id}`;
    } catch (e) {
      console.error(e);
      alert("Erro inesperado");
    }

    setLoading(false);
  }

  // -----------------------------
  //  CARTÃO / TRANSAK
  // -----------------------------
  async function pagarTransak() {
    if (!amountBRL || Number(amountBRL) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const token = localStorage.getItem("sb-access-token");
    if (!token) {
      alert("Você precisa estar logado para comprar.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transak/novo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountBRL: Number(amountBRL),
          tokens,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Erro ao iniciar compra com cartão.");
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      alert("Erro inesperado");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Comprar BCT
        </h1>

        {/* VALOR EM REAIS */}
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

        {/* INFORMAÇÃO DO TOKEN */}
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
            <span className="text-green-800">
              {tokens.toFixed(6)} BCT
            </span>
          </p>

          <p className="text-sm text-gray-600 mt-2">
            (Conversão: R$ {amountBRL || "0"} → US$ {amountUSD.toFixed(6)})
          </p>
        </div>

        <p className="text-gray-600 text-center mb-8">
          Escolha a forma de pagamento
        </p>

        {/* BOTÕES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <button
            onClick={pagarTransak}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center"
          >
            <h2 className="text-xl font-semibold">Cartão</h2>
            <p className="mt-2 text-sm text-blue-100">Compra instantânea</p>
          </button>

          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center"
          >
            <h2 className="text-xl font-semibold">PIX</h2>
            <p className="mt-2 text-sm text-green-100">Pagamento manual</p>
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