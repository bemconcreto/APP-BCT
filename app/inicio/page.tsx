"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";

export default function InicioPage() {
  const [priceUSD, setPriceUSD] = useState<number | null>(null);
  const [priceBRL, setPriceBRL] = useState<number | null>(null);
  const [variation, setVariation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [saldoBCT, setSaldoBCT] = useState<number | null>(null);

  // 🔥 DÓLAR EM TEMPO REAL
  const [usdToBRL, setUsdToBRL] = useState<number | null>(null);

  // 🔥 BUSCA O SALDO EM wallet_saldos
  const loadSaldo = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("wallet_saldos")
        .select("saldo_bct")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSaldoBCT(Number(data.saldo_bct));
      } else {
        setSaldoBCT(0);
      }
    } catch (err) {
      console.error("Erro ao carregar saldo:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadSaldo();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 🔥 BUSCA O DÓLAR REAL
      const dolarRes = await fetch("/api/dolar", { cache: "no-store" });
      const dolarJson = await dolarRes.json();
      const dolar = dolarJson.dolar;
      setUsdToBRL(dolar);

      // 🔥 BUSCA PREÇO DO BCT
      const response = await fetch("/api/preco-bct", { cache: "no-store" });
      const data = await response.json();

      setPriceUSD(data.usd);

      // 🔥 CÁLCULO DO PREÇO DO BCT EM BRL
      setPriceBRL(data.usd * dolar);

      setVariation(Number(data.variation24h));
    } catch (e) {
      console.error("Erro ao carregar preço:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* -------------------------
            NAV SUPERIOR (novo)
            ordem: Inicio | Comprar | Vender | Carteira | Imóveis | Extrato
           ------------------------- */}
        <nav className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-[#0C3D2E]">
              Inicio
            </Link>

            <Link href="/comprar" className="text-sm text-gray-600 hover:underline">
              Comprar
            </Link>

            <Link href="/vender" className="text-sm text-gray-600 hover:underline">
              Vender
            </Link>

            <Link href="/carteira" className="text-sm text-gray-600 hover:underline">
              {/* usei emoji de carteira — substitua por ícone se preferir */}
              👜 Carteira
            </Link>

            <Link href="/imoveis" className="text-sm text-gray-600 hover:underline">
              Imóveis
            </Link>

            <Link href="/extrato" className="text-sm text-gray-600 hover:underline">
              Extrato
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            Saldo: {saldoBCT !== null ? saldoBCT.toFixed(6) : "—"} BCT
          </div>
        </nav>

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Painel Bem Concreto Token
        </h1>

        {/* 🔥 SALDO DO USUÁRIO */}
        <div className="bg-[#0C3D2E] text-white p-6 rounded-xl text-center shadow-md mb-8">
          <h2 className="text-xl font-semibold">Seu saldo de BCT</h2>

          <p className="text-3xl font-bold mt-3">
            {saldoBCT !== null ? saldoBCT.toFixed(6) : "Carregando..."} BCT
          </p>
        </div>

        {/* BLOCO DO PREÇO */}
        <div className="bg-white shadow-md p-6 rounded-xl text-center border mb-10">
          <h2 className="text-xl font-bold text-[#0C3D2E]">Preço do BCT</h2>

          <p className="text-gray-700 text-lg mt-3">
            USD: {priceUSD !== null ? `$${priceUSD.toFixed(4)}` : "Carregando..."}
          </p>

          <p className="text-gray-700 text-lg">
            BRL: {priceBRL !== null ? `R$ ${priceBRL.toFixed(4)}` : "Carregando..."}
          </p>

          {variation !== null && (
            <p
              className={`mt-2 text-sm font-semibold ${
                variation >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {variation >= 0 ? "▲" : "▼"} {variation.toFixed(2)}%
            </p>
          )}

          <button
            onClick={() => {
              loadData();
              loadSaldo();
            }}
            className="mt-4 bg-[#0C3D2E] text-white px-4 py-2 rounded-lg hover:bg-[#125c45]"
          >
            Atualizar Dados
          </button>
        </div>

        {/* MENU — ORDEM NA TELA: Comprar → Vender → Carteira → Imóveis → Extrato */}
        <p className="text-center text-gray-600 mb-8">
          Selecione uma das opções abaixo para gerenciar seus investimentos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* COMPRAR */}
          <Link href="/comprar">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Comprar</h2>
              <p className="mt-2 text-sm text-blue-100">Adquirir tokens BCT</p>
            </div>
          </Link>

          {/* VENDER */}
          <Link href="/vender">
            <div className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Vender</h2>
              <p className="mt-2 text-sm text-yellow-100">Negociar seus tokens</p>
            </div>
          </Link>

          {/* CARTEIRA (novo) */}
          <Link href="/carteira">
            <div className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Carteira</h2>
              <p className="mt-2 text-sm text-gray-200">Ver saldo e movimentações</p>
            </div>
          </Link>

          {/* IMÓVEIS */}
          <Link href="/imoveis">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Imóveis</h2>
              <p className="mt-2 text-sm text-green-100">Ver imóveis tokenizados</p>
            </div>
          </Link>

          {/* EXTRATO */}
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