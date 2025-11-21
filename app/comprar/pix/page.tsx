"use client";

import { useState } from "react";
import { supabase } from "../../../src/lib/supabaseClient";

export default function PixPage() {
  const [amount, setAmount] = useState("");
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");
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

    const res = await fetch("/api/asaas/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountBRL: Number(amount),
        cpfCnpj: user.user_metadata.cpf,
        user_id: user.id,
        wallet: user.id,
      }),
    });

    const data = await res.json();
    setLoading(false);

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
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar PIX"}
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