"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useBCTPrice } from "@/hooks/useBCTPrice"; // ✔️ CORRETO

// Função para buscar o dólar comercial
async function fetchUSD() {
  try {
    const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
    const data = await r.json();
    return Number(data.USDBRL.bid);
  } catch {
    return null;
  }
}

export default function InicioPage() {
  const { usd: bctUSD, loading } = useBCTPrice();
  const [usdBRL, setUsdBRL] = useState<number | null>(null);

  useEffect(() => {
    fetchUSD().then(setUsdBRL);
  }, []);

  const bctBRL =
    bctUSD && usdBRL ? Number((bctUSD * usdBRL).toFixed(4)) : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* TÍTULO */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Painel Bem Concreto Token
        </h1>

        {/* ➤ NOVA SEÇÃO DE COTAÇÃO REAL (MODELO A) */}
        <div className="bg-white border border-gray-200 shadow-md rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-center text-green-700 mb-4">
            Cotação Atual do BCT (Blockchain)
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Carregando preço...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">

              {/* Preço USD */}
              <div className="p-4 bg-green-50 rounded-lg shadow">
                <p className="text-sm text-gray-500">Preço em USD</p>
                <p className="text-2xl font-bold text-green-700">
                  {bctUSD ? `$ ${bctUSD.toFixed(4)}` : "--"}
                </p>
              </div>

              {/* Preço BRL */}
              <div className="p-4 bg-green-50 rounded-lg shadow">
                <p className="text-sm text-gray-500">Preço em BRL</p>
                <p className="text-2xl font-bold text-green-700">
                  {bctBRL ? `R$ ${bctBRL}` : "--"}
                </p>
              </div>

              {/* Variação 24h (fixa por enquanto) */}
              <div className="p-4 bg-green-50 rounded-lg shadow">
                <p className="text-sm text-gray-500">Variação 24h</p>
                <p className="text-2xl font-bold text-green-700">+0.00%</p>
              </div>

            </div>
          )}
        </div>

        {/* SUBTÍTULO */}
        <p className="text-center text-gray-600 mb-10">
          Selecione uma das opções abaixo para gerenciar seus investimentos.
        </p>

        {/* BOTÕES JÁ EXISTENTES - INTATOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/imoveis">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Imóveis</h2>
              <p className="mt-2 text-sm text-green-100">
                Ver imóveis tokenizados
              </p>
            </div>
          </Link>

          <Link href="/comprar">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Comprar</h2>
              <p className="mt-2 text-sm text-blue-100">
                Adquirir tokens BCT
              </p>
            </div>
          </Link>

          <Link href="/vender">
            <div className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Vender</h2>
              <p className="mt-2 text-sm text-yellow-100">
                Negociar seus tokens
              </p>
            </div>
          </Link>

          <Link href="/extrato">
            <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Extrato</h2>
              <p className="mt-2 text-sm text-indigo-100">
                Acompanhar histórico
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}