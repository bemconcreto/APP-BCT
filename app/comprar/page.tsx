"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../src/lib/supabaseClient";
import { formatReal } from "@/utils/format";
import { formatBCT } from "@/utils/format";
import { formatNumber } from "@/utils/format";

// -----------------------------
// PEGAR TOKEN DO SUPABASE
// -----------------------------
async function getSupabaseToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

// -----------------------------
// PEGAR USUÁRIO LOGADO
// -----------------------------
async function getUserSession() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export default function ComprarPage() {
  const [amountBRL, setAmountBRL] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tokenPriceUSD = 1.00;

  // -----------------------------
  // BUSCA O DÓLAR EM TEMPO REAL
  // -----------------------------
  const [usdToBRL, setUsdToBRL] = useState<number | null>(null);

  useEffect(() => {
    async function loadDollar() {
      try {
        const res = await fetch("/api/dolar", { cache: "no-store" });
        const json = await res.json();
        if (json.success) setUsdToBRL(json.dolar);
      } catch (e) {
        console.log("Erro ao buscar dólar:", e);
      }
    }
    loadDollar();
  }, []);

  // -----------------------------
  // CARREGA USUÁRIO AO ABRIR
  // -----------------------------
  useEffect(() => {
    async function loadUser() {
      setUser(await getUserSession());
    }
    loadUser();
  }, []);

  // -----------------------------
  // CÁLCULO DE TOKENS (CORRIGIDO)
  // -----------------------------
  const valorUSD =
    amountBRL && usdToBRL ? Number(amountBRL) / usdToBRL : 0;

  const tokens = valorUSD ? valorUSD / tokenPriceUSD : 0;

  // -----------------------------
  // PAGAR VIA PIX
  // -----------------------------
  async function pagarPix() {
    const token = await getSupabaseToken();

    if (!token) return alert("Você precisa estar logado.");
    if (!cpfCnpj) return alert("Digite seu CPF/CNPJ.");
    if (!amountBRL || Number(amountBRL) <= 0)
      return alert("Digite um valor válido.");

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
          cpfCnpj,
          email: user?.email ?? "",
          nome: user?.user_metadata?.full_name ?? "Usuário",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Erro ao gerar PIX: " + JSON.stringify(data.error));
        return;
      }

      window.location.href = `/comprar/pix?pedido=${data.id}`;
    } catch (e) {
      alert("Erro inesperado no PIX.");
    }

    setLoading(false);
  }

  // -----------------------------
  // PAGAR VIA CARTÃO
  // -----------------------------
async function pagarCartao() {
  const token = await getSupabaseToken();

  if (!token) return alert("Você precisa estar logado.");
  if (!cpfCnpj) return alert("Digite seu CPF/CNPJ.");
  if (!amountBRL || Number(amountBRL) <= 0)
    return alert("Digite um valor válido.");

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
        tokens: Number(tokens.toFixed(6)),
        cpfCnpj,
        email: user?.email ?? "",
        nome: user?.user_metadata?.full_name ?? "Usuário",
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Erro ao iniciar pagamento com cartão: " + data.error);
      return;
    }

    // Redireciona agora para a tela do cartão SOMENTE SE passou da trava:
    window.location.href = `/comprar/cartao?pedido=${data.id}`;
  } catch (e) {
    alert("Erro inesperado ao iniciar pagamento com cartão.");
  }

  setLoading(false);
}

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Comprar BCT
        </h1>

        {/* CPF */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">CPF ou CNPJ</label>
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Digite seu CPF/CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
          />
        </div>

        {/* Valor */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Valor (R$)</label>
          <input
            type="number"
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Ex: 100"
            value={amountBRL}
            onChange={(e) => setAmountBRL(e.target.value)}
          />
        </div>

        {/* Simulação */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-8">
          <p>Preço do BCT: US$ {formatNumber(tokenPriceUSD)}</p>

          <p>
            Dólar:{" "}
            {usdToBRL ? formatReal (usdToBRL) : "Carregando..."}
          </p>

          <p className="text-lg font-semibold mt-2">
            Você receberá:{" "}
            <span className="text-[#CBA35C]">
              {formatBCT (tokens)} BCT
            </span>
          </p>
        </div>

        {/* Botões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
<button
  onClick={() => {
    window.location.href =
      `/comprar/cartao?amountBRL=${amountBRL}` +
      `&cpfCnpj=${cpfCnpj}` +
      `&email=${user?.email}` +
      `&tokens=${tokens.toFixed(6)}`;
  }}
  disabled={loading}
  className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700"
>
  <h2 className="text-xl font-semibold">Cartão</h2>
</button>

          <button
            onClick={pagarPix}
            disabled={loading}
            className="bg-[#101820] text-white rounded-lg p-6 hover:bg-[#101820]"
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