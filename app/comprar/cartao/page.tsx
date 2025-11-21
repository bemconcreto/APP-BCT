"use client";

import { useState } from "react";

export default function CartaoPage() {
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [erro, setErro] = useState("");

  async function pagar() {
    setErro("");

    const res = await fetch("/api/asaas/cartao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        numero,
        mes,
        ano,
        cvv,
        amountBRL: Number(amount),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setErro("Erro ao gerar pagamento com cartão: " + data.error);
      return;
    }

    alert("Pagamento aprovado!");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento com Cartão</h1>

      {erro && <p className="bg-red-200 p-2 mb-4">{erro}</p>}

      <input placeholder="Nome no cartão" className="border p-2 w-full mb-3"
        value={nome} onChange={e => setNome(e.target.value)} />

      <input placeholder="Número do cartão" className="border p-2 w-full mb-3"
        value={numero} onChange={e => setNumero(e.target.value)} />

      <div className="flex gap-2 mb-3">
        <input placeholder="MM" className="border p-2 w-1/2"
          value={mes} onChange={e => setMes(e.target.value)} />

        <input placeholder="AA" className="border p-2 w-1/2"
          value={ano} onChange={e => setAno(e.target.value)} />
      </div>

      <input placeholder="CVV" className="border p-2 w-full mb-3"
        value={cvv} onChange={e => setCvv(e.target.value)} />

      <input placeholder="Valor (R$)" type="number"
        className="border p-2 w-full mb-3"
        value={amount} onChange={e => setAmount(e.target.value)} />

      <button onClick={pagar}
        className="bg-blue-600 p-3 rounded text-white w-full">
        Pagar
      </button>
    </div>
  );
}