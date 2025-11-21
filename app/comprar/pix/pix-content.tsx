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

  useEffect(() => {
    async function carregarPagamento() {
      if (!pedidoId) {
        setErro("Dados do PIX não encontrados.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/pix/status?id=${pedidoId}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Não foi possível carregar o pagamento.");
          setLoading(false);
          return;
        }

        // Primeiro tenta pegar direto da API
        let qr = data.qrCode;
        let copy = data.copiaCola;

        // Se estiverem nulos, tentamos buscar do invoiceUrl
        if ((!qr || !copy) && data.raw?.invoiceUrl) {
          const invoiceUrl = data.raw.invoiceUrl;

          // Busca o HTML da página da cobrança
          const html = await fetch(invoiceUrl).then(r => r.text());

          // Extrai texto "copia e cola"
          const matchCopy = html.match(/([0-9A-Za-z]{30,})/);
          if (matchCopy) {
            copy = matchCopy[1];
          }
        }

        setQrCode(qr || "");
        setCopiaCola(copy || "");
      } catch (e) {
        setErro("Erro ao carregar o PIX.");
      }

      setLoading(false);
    }

    carregarPagamento();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Gerando PIX...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

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