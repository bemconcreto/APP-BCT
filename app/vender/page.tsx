// app/vender/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function VenderPage() {
  const [saldoBCT, setSaldoBCT] = useState<number | null>(null);
  const [tokens, setTokens] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [usdToBrl, setUsdToBrl] = useState<number | null>(null);
  const [tokenUsd, setTokenUsd] = useState<number>(1.00);
  const FEE = 0.10;
  const [msg, setMsg] = useState<string>("");

  // 🔥 Popup de sucesso
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    loadSaldo();
    loadMarket();
  }, []);

  async function loadSaldo() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("wallet_saldos")
        .select("saldo_bct")
        .eq("user_id", user.id)
        .single();

      setSaldoBCT(Number(data?.saldo_bct ?? 0));
    } catch (e) {
      console.error("erro saldo:", e);
    }
  }

  async function loadMarket() {
    try {
      const r = await fetch("/api/dolar", { cache: "no-store" });
      const j = await r.json();
      if (j?.dolar) setUsdToBrl(Number(j.dolar));

      const p = await fetch("/api/preco-bct", { cache: "no-store" });
      const pj = await p.json();
      if (pj?.usd) setTokenUsd(Number(pj.usd));
    } catch (e) {
      console.warn("erro loadMarket:", e);
    }
  }

  const numericTokens = Number(tokens || 0);
  const valorBRL = usdToBrl && tokenUsd ? numericTokens * tokenUsd * usdToBrl : 0;
  const taxaBRL = valorBRL * FEE;
  const estimatedBRL = valorBRL - taxaBRL;

  async function submitSell() {
    setMsg("");

    if (!numericTokens || numericTokens <= 0)
      return setMsg("Informe uma quantidade válida.");

    if (saldoBCT === null || numericTokens > saldoBCT)
      return setMsg("Saldo insuficiente.");

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setMsg("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/vender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tokens: numericTokens }),
      });

      const j = await res.json();

      if (!j.success) {
        setMsg(j.error || "Erro ao processar a venda.");
      } else {
        // 🔥 Popup de Sucesso
        setPopupMessage(
          `Sua venda foi realizada com sucesso! Você receberá R$ ${Number(
            j.valor_brl
          ).toFixed(2)} na sua carteira.`
        );
        setShowPopup(true);

        setSaldoBCT(Number(j.novo_saldo_bct));
        setTokens("");
      }
    } catch (e) {
      console.error(e);
      setMsg("Erro interno ao enviar venda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Vender BCT</h1>

        <p className="mb-4">
          Saldo disponível:{" "}
          {saldoBCT !== null ? saldoBCT.toFixed(6) : "Carregando..."} BCT
        </p>

        <label className="block mb-2 font-semibold">
          Quantidade de BCT a vender
        </label>
        <input
          type="number"
          value={tokens}
          onChange={(e) => setTokens(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          placeholder="Ex: 1.234567"
        />

        <div className="bg-gray-50 border rounded p-4 mb-4">
          <p>Taxa: {Math.round(FEE * 100)}%</p>
          <p>Tokens vendidos: {tokens ? numericTokens.toFixed(6) : "0.000000"}</p>
          <p>Preço token (USD): ${tokenUsd.toFixed(2)}</p>
          <p>Dólar: {usdToBrl ? `R$ ${usdToBrl.toFixed(2)}` : "Carregando..."}</p>

          <p className="font-semibold mt-2">
            Estimativa a receber: R$ {estimatedBRL.toFixed(2)}
          </p>
        </div>

        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}

        <div className="flex gap-4">
          <button
            onClick={submitSell}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Processando..." : "Confirmar venda"}
          </button>

          <Link href="/">
            <span className="inline-block bg-gray-200 px-4 py-2 rounded cursor-pointer">
              Voltar
            </span>
          </Link>
        </div>
      </div>

      {/* 🔥 POPUP DE SUCESSO */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-[#CBA35C]">
              Venda realizada!
            </h2>

            <p className="mb-6">{popupMessage}</p>

            <button
              onClick={() => setShowPopup(false)}
              className="bg-[#101820] hover:bg-[#101820] text-white py-2 px-6 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}