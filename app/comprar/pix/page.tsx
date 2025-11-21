"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PixPage() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!pedido) {
        setErro("Pedido inválido.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/asaas/pix/status?id=${pedido}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Erro ao carregar PIX.");
          setLoading(false);
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
      } catch (e) {
        setErro("Erro inesperado.");
      }

      setLoading(false);
    }

    carregar();
  }, [pedido]);

  function copiarPix() {
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
        <p className="text-gray-700 text-lg">Carregando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img src={qrCode} className="w-64 h-64 mb-6" alt="QR Code" />

      <button
        onClick={copiarPix}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="max-w-lg break-all text-gray-700">{copiaCola}</p>

      <a
        href="/comprar"
        className="mt-10 inline-block bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
      >
        Voltar para compra
      </a>
    </div>
  );
}