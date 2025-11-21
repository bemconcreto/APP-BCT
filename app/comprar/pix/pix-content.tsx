"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  // 🔥 FUNÇÃO QUE BUSCA O STATUS
  async function consultarStatus() {
    try {
      const res = await fetch(`/api/pix/status?id=${pedidoId}`);
      const data = await res.json();

      if (!data.success) return;

      // ASAAS às vezes demora para gerar esses campos
      const qr =
        data.qrCode ??
        data.pixQrCodeImage ??
        data.raw?.pixQrCodeImage ??
        null;

      const copy =
        data.copiaCola ??
        data.pixTransaction ??
        data.raw?.pixTransaction ??
        null;

      if (qr) setQrCode(qr);
      if (copy) setCopiaCola(copy);

      // Se ainda não veio, continua tentando
      if (!qr || !copy) {
        setTimeout(consultarStatus, 3000);
      } else {
        setLoading(false);
      }

    } catch (e) {
      setErro("Erro inesperado.");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!pedidoId) {
      setErro("Dados do PIX não encontrados.");
      setLoading(false);
      return;
    }

    consultarStatus();
  }, [pedidoId]);

  function copiarCodigo() {
    if (!copiaCola) return;
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

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      {loading && <p className="text-gray-600 mb-4">Gerando PIX...</p>}

      {qrCode ? (
        <img src={qrCode} alt="QR Code" className="w-64 h-64 mb-6" />
      ) : (
        <p className="text-red-500 mb-4">QR Code ainda não disponível...</p>
      )}

      <button
        onClick={copiarCodigo}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl">
        {copiaCola || "Aguardando código PIX..."}
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