"use client";

import { useState } from "react";
import { supabase } from "../../../src/lib/supabaseClient";

export default function PixPage() {
  const [amount, setAmount] = useState("");
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function gerarPix() {
    setErro("");
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      setErro("Faça login novamente.");
      setLoading(false);
      return;
    }

    const cpfCnpj = user.user_metadata?.cpf || "";

    if (!cpfCnpj) {
      setErro("Seu CPF não foi encontrado.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/asaas/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBRL: Number(amount),
          cpfCnpj,
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErro("Erro ao gerar PIX.");
        setLoading(false);
        return;
      }

      setQrCode(data.qrCode);
      setCopia(data.copiaCola);
    } catch (e) {
      setErro("Erro inesperado.");
    }

    setLoading(false);
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(copia);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  // Tela de carregamento
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p className="text-gray-600 text-lg">Gerando PIX...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Pagamento via PIX</h1>

      {erro && <p className="bg-red-200 p-2 mb-4 text-center">{erro}</p>}

      {!qrCode && (
        <>
          {/* Valor */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            placeholder="Valor em Reais"
          />

          <button
            onClick={gerarPix}
            className="bg-green-600 p-3 rounded text-white w-full"
          >
            Gerar PIX
          </button>
        </>
      )}

      {qrCode && (
        <div className="text-center mt-6">
          <img src={qrCode} className="mx-auto w-64 mb-6" />

          <button
            onClick={copiarCodigo}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg mb-4"
          >
            {copiado ? "COPIADO!" : "Copiar código PIX"}
          </button>

          <p className="mt-4 break-all bg-gray-100 p-3 rounded max-w-xl mx-auto">
            {copia}
          </p>

          <a
            href="/comprar"
            className="mt-10 inline-block bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
          >
            Voltar
          </a>
        </div>
      )}
    </div>
  );
}