"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";
import { formatReal } from "@/utils/format";
import { formatBCT } from "@/utils/format";

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

  const saldoReais =
    saldoBCT !== null && priceBRL !== null ? saldoBCT * priceBRL : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* 🔥 TEXTO DIMINUÍDO */}
        <h1 className="text-xl font-bold text-center mb-4 text-[#7A5D53]">
          Um pedaço do mundo na palma da sua mão
        </h1>

        {/* 🔥 SALDO DO USUÁRIO — SUBIDO */}
        <div className="bg-[#101820] text-white p-6 rounded-xl text-center shadow-md mb-6">
          <h2 className="text-xl font-semibold">Seu saldo de BCT</h2>

          <p className="text-3xl font-bold mt-3">
            {saldoBCT !== null ? formatBCT(saldoBCT) : "Carregando..."} BCT
          </p>
        </div>

        {/* 🔥 NOVO BLOCO — SALDO EM REAIS */}
        <div className="bg-[#101820] text-white p-6 rounded-xl text-center shadow-md mb-8">
          <h2 className="text-xl font-semibold">Seu saldo em Reais</h2>

          <p className="text-3xl font-bold mt-3">
            {saldoReais !== null ? formatReal(saldoReais) : "Carregando..."}
          </p>
        </div>

        {/* BLOCO DO PREÇO */}
        <div className="bg-white shadow-md p-6 rounded-xl text-center border mb-10">
          <h2 className="text-xl font-bold text-[#CBA35C]">Preço do BCT</h2>

          <p className="text-gray-700 text-lg mt-3">
            USD: {priceUSD !== null ? formatReal(priceUSD) : "Carregando..."}
          </p>

          <p className="text-gray-700 text-lg">
            BRL: {priceBRL !== null ? formatReal(priceBRL) : "Carregando..."}
          </p>

          {variation !== null && (
            <p
              className={`mt-2 text-sm font-semibold ${
                variation >= 0 ? "text-[#CBA35C]" : "text-red-600"
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
            className="mt-4 bg-[#101820] text-white px-4 py-2 rounded-lg hover:bg-[#125c45]"
          >
            Atualizar valores
          </button>
        </div>

        {/* MENU */}
        <p className="text-center text-gray-600 mb-8">
          Selecione uma das opções abaixo para gerenciar seus investimentos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* COMPRAR */}
          <Link href="/comprar">
            <div className="bg-[#CBA35C] hover:bg-[#b39149] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Comprar</h2>
              <p className="mt-2 text-sm text-white/80">Adquirir tokens BCT</p>
            </div>
          </Link>

          {/* VENDER */}
          <Link href="/vender">
            <div className="bg-[#8D6E63] hover:bg-[#7c5f55] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Vender</h2>
              <p className="mt-2 text-sm text-white/80">Negociar seus tokens</p>
            </div>
          </Link>

          {/* CARTEIRA */}
          <Link href="/carteira">
            <div className="bg-[#4C3B34] hover:bg-[#3f2f29] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Carteira</h2>
              <p className="mt-2 text-sm text-white/80">Saldo em Reais</p>
            </div>
          </Link>

          {/* IMÓVEIS */}
          <Link href="/imoveis">
            <div className="bg-[#101820] hover:bg-[#0d1318] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Imóveis</h2>
              <p className="mt-2 text-sm text-[#CBA35C]">Ver imóveis tokenizados</p>
            </div>
          </Link>

          {/* EXTRATO */}
          <Link href="/extrato">
            <div className="bg-[#3A3F47] hover:bg-[#30353b] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Extrato</h2>
              <p className="mt-2 text-sm text-white/80">Acompanhar histórico</p>
            </div>
          </Link>

          {/* TRANSPARÊNCIA */}
          <Link href="/transparencia">
            <div className="bg-[#CBA35C] hover:bg-[#b39149] text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Transparência</h2>
              <p className="mt-2 text-sm text-white/80">Ver subcontas</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}