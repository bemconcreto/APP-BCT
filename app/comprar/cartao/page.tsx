"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../src/lib/supabaseClient";

export default function CartaoPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    amountBRL: "",
    holderName: "",
    cpfCnpj: "",
    email: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function pagarCartao() {
    setErro("");
    setLoading(true);

    try {
      // 🔥 Buscar usuário logado
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;

      if (!user) {
        setErro("Faça login novamente.");
        setLoading(false);
        return;
      }

      const user_id = user.id;
      const wallet = user.id; // carteira = id do usuário

      // 🔥 Enviar tudo ao backend
      const res = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          user_id,
          wallet,
        }),
      });

      const data = await res.json();
      console.log("RES:", data);

      if (!data.success) {
        setErro(data.error || "Erro ao pagar.");
        setLoading(false);
        return;
      }

      // Se deu certo → vai para tela de sucesso
      window.location.href = `/comprar/sucesso?id=${data.id}`;

    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao processar pagamento.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-6">
          Pagamento com Cartão
        </h1>

        {erro && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            ❌ {erro}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 mb-6">

          <input
            type="number"
            placeholder="Valor em Reais"
            className="border p-3 rounded"
            value={form.amountBRL}
            onChange={(e) => updateField("amountBRL", e.target.value)}
          />

          <input
            type="text"
            placeholder="Nome do Titular"
            className="border p-3 rounded"
            value={form.holderName}
            onChange={(e) => updateField("holderName", e.target.value)}
          />

          <input
            type="text"
            placeholder="CPF ou CNPJ"
            className="border p-3 rounded"
            value={form.cpfCnpj}
            onChange={(e) => updateField("cpfCnpj", e.target.value)}
          />

          <input
            type="email"
            placeholder="E-mail"
            className="border p-3 rounded"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <input
            type="text"
            placeholder="Número do Cartão"
            className="border p-3 rounded"
            value={form.cardNumber}
            onChange={(e) => updateField("cardNumber", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Mês (MM)"
              className="border p-3 rounded"
              value={form.expiryMonth}
              onChange={(e) => updateField("expiryMonth", e.target.value)}
            />
            <input
              type="text"
              placeholder="Ano (AA)"
              className="border p-3 rounded"
              value={form.expiryYear}
              onChange={(e) => updateField("expiryYear", e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="CVV"
            className="border p-3 rounded"
            value={form.cvv}
            onChange={(e) => updateField("cvv", e.target.value)}
          />
        </div>

        <button
          onClick={pagarCartao}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded text-lg"
        >
          {loading ? "Processando..." : "Pagar agora"}
        </button>

        <div className="text-center mt-6">
          <Link href="/comprar">
            <span className="text-gray-600 underline cursor-pointer">
              Voltar
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}