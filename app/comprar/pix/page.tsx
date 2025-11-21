"use client";

import { useState } from "react";

export default function PixCheckoutPage() {
  const [amount, setAmount] = useState("");
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function gerarPix() {
    setErro("");

    setLoading(true);

    try {
      const res = await fetch("/api/asaas/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountBRL: Number(amount) }),
      });

      const data = await res.json();

      if (!data.success) {
        setErro("Erro ao gerar PIX.");
        setLoading(false);
        return;
      }

      setQrCode(data.qrCode);
      setCopia(data.copiaCola);
    } catch (err) {
      setErro("Erro inesperado.");
    }

    setLoading(false);
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(copia);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6">

      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      {!qrCode && (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
          {erro && (
            <p className="bg-red-200 text-red-800 p-3 rounded mb-3">{erro}</p>
          )}

          <input
            type="number"
            placeholder="Valor em Reais"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded p-3 w-full mb-4"
          />

          <button
            onClick={gerarPix}
            disabled={loading}
            className="bg-green-600 text-white w-full p-3 rounded text-lg"
          >
            {loading ? "Gerando PIX..." : "Gerar PIX"}
          </button>
        </div>
      )}

      {qrCode && (
        <div className="flex flex-col items-center">
          <img src={qrCode} className="w-64 h-64 mb-6" />

          <button
            onClick={copiarCodigo}
            className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
          >
            {copiado ? "COPIADO!" : "Copiar código PIX"}
          </button>

          <p className="text-gray-700 break-all text-center max-w-xl mb-6">
            {copia}
          </p>

          <a
            href="/comprar"
            className="bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
          >
            Voltar
          </a>
        </div>
      )}

    </div>
  );
}