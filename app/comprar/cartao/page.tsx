"use client";

import { useState } from "react";

export default function CartaoPage() {
  const [form, setForm] = useState({
    nome: "",
    numero: "",
    mes: "",
    ano: "",
    cvv: "",
    valor: ""
  });

  const [erro, setErro] = useState("");

  function atualizar(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function pagar() {
    setErro("");

    if (!form.nome || !form.numero || !form.mes || !form.ano || !form.cvv) {
      setErro("Preencha todos os dados do cartão.");
      return;
    }

    const res = await fetch("/api/asaas/cartao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        numero: form.numero,
        mes: form.mes,
        ano: form.ano,
        cvv: form.cvv,
        valor: Number(form.valor),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setErro(`Erro ao gerar pagamento com cartão: ${data.error}`);
      return;
    }

    alert("Pagamento aprovado!");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pagamento com Cartão</h1>

      {erro && <p className="bg-red-200 p-2 mb-4">{erro}</p>}

      <input
        name="nome"
        placeholder="Nome no cartão"
        className="border p-2 w-full mb-3"
        onChange={atualizar}
      />
      <input
        name="numero"
        placeholder="Número do cartão"
        className="border p-2 w-full mb-3"
        onChange={atualizar}
      />
      <div className="flex gap-2">
        <input
          name="mes"
          placeholder="Mês (MM)"
          className="border p-2 w-full mb-3"
          onChange={atualizar}
        />
        <input
          name="ano"
          placeholder="Ano (AAAA)"
          className="border p-2 w-full mb-3"
          onChange={atualizar}
        />
      </div>
      <input
        name="cvv"
        placeholder="CVV"
        className="border p-2 w-full mb-3"
        onChange={atualizar}
      />
      <input
        name="valor"
        placeholder="Valor"
        className="border p-2 w-full mb-3"
        onChange={atualizar}
      />

      <button
        onClick={pagar}
        className="bg-blue-600 text-white p-3 rounded w-full"
      >
        Pagar
      </button>
    </div>
  );
}