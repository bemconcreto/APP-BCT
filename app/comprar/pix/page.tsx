"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixCheckoutPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregarPagamento() {
      if (!pedidoId) {
        setErro("Pedido inválido.");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`/api/asaas/pix/status?id=${pedidoId}`);

        const data = await res.json();
        if (!data.success) {
          setErro("Erro ao carregar pagamento.");
          setLoading(false);
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
      } catch (err) {
        setErro("Erro inesperado.");
      }

      setLoading(false);
    }

    carregarPagamento();
  }, [pedidoId]);

  function copiarCodigo() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="bg-red-200 text-red-800 px-6 py-3 rounded">{erro}</p>
      </div>
    );
  }

  if (loading || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Carregando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img src={qrCode} alt="QR Code" className="w-64 h-64 mb-6" />

      <button
        onClick={copiarCodigo}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl">
        {copiaCola}
      </p>

      <a
        href="/comprar"
        className="mt-10 inline-block bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
      >
        Voltar
      </a>
    </div>
  );
}