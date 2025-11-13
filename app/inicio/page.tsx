"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function InicioPage() {
  const [priceUSD, setPriceUSD] = useState<number | null>(null);
  const [priceBRL, setPriceBRL] = useState<number | null>(null);
  const [variation, setVariation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/preco-bct");
      const data = await response.json();

      setPriceUSD(data.usd);
      setPriceBRL(data.brl);
      setVariation(data.variation24h);
    } catch (e) {
      console.error("Erro ao carregar preço:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Painel Bem Concreto Token
        </h1>

        {/* BLOCO DO PREÇO DO BCT */}
        <div className="bg-white shadow-md p-6 rounded-xl text-center border mb-10">
          <h2 className="text-xl font-bold text-[#0C3D2E]">Preço do BCT</h2>

          <p className="text-gray-700 text-lg mt-3">
            USD: {priceUSD ? `$${priceUSD.toFixed(4)}` : "Carregando..."}
          </p>

          <p className="text-gray-700 text-lg">
            BRL: {priceBRL ? `R$ ${priceBRL.toFixed(4)}` : "Carregando..."}
          </p>

          <p
            className={`mt-2 text-sm font-semibold ${
              variation >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {variation >= 0 ? "▲" : "▼"} {variation.toFixed(2)}%
          </p>

          <button
            onClick={loadData}
            className="mt-4 bg-[#0C3D2E] text-white px-4 py-2 rounded-lg hover:bg-[#125c45]"
          >
            Atualizar Preço
          </button>
        </div>

        {/* BOTÕES DO PAINEL */}
        <p className="text-center text-gray-600 mb-8">
          Selecione uma das opções abaixo para gerenciar seus investimentos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/imoveis">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Imóveis</h2>
              <p className="mt-2 text-sm text-green-100">Ver imóveis tokenizados</p>
            </div>
          </Link>

          <Link href="/comprar">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Comprar</h2>
              <p className="mt-2 text-sm text-blue-100">Adquirir tokens BCT</p>
            </div>
          </Link>

          <Link href="/vender">
            <div className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Vender</h2>
              <p className="mt-2 text-sm text-yellow-100">Negociar seus tokens</p>
            </div>
          </Link>

          <Link href="/extrato">
            <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Extrato</h2>
              <p className="mt-2 text-sm text-indigo-100">Acompanhar histórico</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}