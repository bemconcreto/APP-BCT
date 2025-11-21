"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PixCheckoutPage() {
  const params = useSearchParams();
  const pedido = params.get("pedido");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");

  useEffect(() => {
    async function carregarPagamento() {
      if (!pedido) {
        setError("Pedido inválido.");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`/api/asaas/consulta?payment_id=${pedido}`);
        const data = await resp.json();

        if (!resp.ok || !data.success) {
          setError("Erro ao carregar pagamento.");
        } else {
          setQrCode(data.qrCode);
          setCopiaCola(data.copiaCola);
        }
      } catch {
        setError("Erro inesperado.");
      }

      setLoading(false);
    }

    carregarPagamento();
  }, [pedido]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Pagamento via PIX</h1>

        {loading && <p className="text-center">Carregando...</p>}

        {error && (
          <p className="bg-red-200 text-red-800 p-3 rounded text-center mb-4">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <img src={qrCode} className="w-64 mx-auto" alt="QR Code PIX" />
            <p className="mt-6 font-semibold text-center">Copia e Cola:</p>
            <p className="break-all bg-gray-100 p-3 rounded text-sm">{copiaCola}</p>
          </>
        )}
      </div>
    </div>
  );
}