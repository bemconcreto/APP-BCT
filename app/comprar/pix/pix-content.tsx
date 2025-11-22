"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [status, setStatus] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/pix/status?id=${pedidoId}`);
      const data = await res.json();

      if (!data.success) {
        setErro("Erro ao carregar o PIX.");
        return;
      }

      setQrCode(data.qrCode);
      setCopiaCola(data.copiaCola);
      setStatus(data.status);
      setCarregando(false);
    } catch {
      setErro("Erro ao carregar o PIX.");
    }
  }

  useEffect(() => {
    if (!pedidoId) {
      setErro("ID do PIX não encontrado.");
      return;
    }

    load();
  }, [pedidoId]);

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="bg-red-200 text-red-800 px-6 py-3 rounded">{erro}</p>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      {qrCode ? (
        <img src={qrCode} alt="QR Code" className="w-64 h-64 mb-6" />
      ) : (
        <p className="text-red-500 mb-4">QR Code não disponível.</p>
      )}

      <p className="text-gray-600 mb-4">{status}</p>

      <button
        onClick={() => {
          navigator.clipboard.writeText(copiaCola);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        }}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-center break-all max-w-xl">{copiaCola}</p>
    </div>
  );
}