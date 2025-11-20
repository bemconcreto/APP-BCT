"use client";

import { useState } from "react";
import { supabase } from "../../../src/lib/supabaseClient";

export default function PixPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function gerarPix(event: any) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    const { amountBRL } = Object.fromEntries(new FormData(event.target));

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        setErro("Faça login novamente.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/asaas/pix", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amountBRL }),
      });

      const data = await res.json();

      if (!data.success) {
        setErro("Erro ao gerar PIX.");
        setLoading(false);
        return;
      }

      // IR PARA A TELA DE SUCESSO QUE JÁ EXISTIA
      window.location.href = `/comprar/sucesso?id=${data.id}`;

    } catch (error) {
      console.error(error);
      setErro("Erro inesperado.");
    }

    setLoading(false);
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

      {erro && <p className="bg-red-200 p-3 mb-4">{erro}</p>}

      <form onSubmit={gerarPix} className="space-y-4">
        <input
          type="number"
          name="amountBRL"
          placeholder="Valor em Reais"
          className="border w-full p-3 rounded"
        />

        <button
          className="bg-green-600 text-white p-4 rounded w-full"
          disabled={loading}
        >
          {loading ? "Gerando PIX..." : "Gerar PIX"}
        </button>
      </form>
    </div>
  );
}