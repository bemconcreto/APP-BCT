"use client";

import { useState } from "react";

export default function PixPage() {
  const [amount, setAmount] = useState("");
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");

  async function gerarPix() {
    setErro("");

    const params = new URLSearchParams(window.location.search);
    const pedido = params.get("pedido"); // ID da cobrança do Asaas (se vier)
    const cpfCnpj = params.get("cpfCnpj");
    const user_id = params.get("user_id");

    if (!cpfCnpj || !user_id) {
      setErro("Dados não encontrados.");
      return;
    }

    const res = await fetch("/api/asaas/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountBRL: Number(amount),
        cpfCnpj,
        user_id,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setErro(data.error || "Erro ao gerar PIX.");
      return;
    }

    setQrCode(data.qrCode);
    setCopia(data.copiaCola);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

      {erro && <p className="bg-red-200 p-2">{erro}</p>}

      {!qrCode && (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full mb-4"
            placeholder="Valor"
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
          <img src={qrCode} className="mx-auto w-64" />
          <p className="mt-4 break-all">{copia}</p>
        </div>
      )}
    </div>
  );
}