"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CartaoCheckout() {
  const params = useSearchParams();

  // dados vindos da página anterior
  const amountBRL = params.get("amountBRL");
  const cpfCnpj = params.get("cpfCnpj");
  const email = params.get("email");
  const tokens = params.get("tokens");

  // campos do cartão
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function pagar() {
    setErro("");

    if (loading) return; // evita duplo clique

    if (!nome || !numero || !mes || !ano || !cvv) {
      setErro("Preencha todos os campos do cartão.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          numero,
          mes,
          ano,
          cvv,
          amountBRL,
          tokens,
          cpfCnpj,
          email,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErro("Erro ao gerar pagamento com cartão: " + data.error);
        setLoading(false);
        return;
      }

      alert("Pagamento aprovado!");
    } catch (err) {
      setErro("Erro inesperado ao processar pagamento.");
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento com Cartão</h1>

      {erro && <p className="bg-red-200 p-2 mb-3 text-red-700">{erro}</p>}

      <input
        placeholder="Nome no Cartão"
        className="border p-2 w-full mb-3"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        placeholder="Número do Cartão"
        className="border p-2 w-full mb-3"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />

      <div className="flex gap-2 mb-3">
        <input
          placeholder="MM"
          className="border p-2 w-1/2"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
        <input
          placeholder="AA"
          className="border p-2 w-1/2"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        />
      </div>

      <input
        placeholder="CVV"
        className="border p-2 w-full mb-3"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
      />

      <button
        onClick={pagar}
        disabled={loading}
        className={`p-3 rounded text-white w-full ${
          loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processando..." : "Pagar"}
      </button>
    </div>
  );
}