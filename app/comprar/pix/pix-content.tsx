// app/comprar/pix/pix-content.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copiaCola, setCopiaCola] = useState<string | null>(null);
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

        if (!res.ok) {
          // tenta mostrar mensagem do backend (se houver)
          try {
            const txt = await res.text();
            setErro("Erro ao consultar o status do PIX: " + txt);
          } catch {
            setErro("Erro ao consultar o status do PIX.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data || !data.success) {
          setErro(
            "Dados do PIX não encontrados. " +
              (data?.error ? JSON.stringify(data.error) : "")
          );
          setLoading(false);
          return;
        }

        // aqui usamos os campos normalizados que o status devolve
        // mas também aceitaremos `raw` caso algo mude
        const qr =
          data.qrCode ??
          data.raw?.pixQrCodeImage ??
          data.raw?.pixQrCode ??
          null;
        const copy =
          data.copiaCola ??
          data.raw?.pixCopiaECola ??
          data.raw?.pixTransaction ??
          data.raw?.pix_copy_paste ??
          null;

        setQrCode(qr);
        setCopiaCola(copy ?? null);
      } catch (e) {
        setErro("Erro inesperado ao buscar status do PIX.");
      } finally {
        setLoading(false);
      }
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
        Carregando PIX...
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

      <button
        onClick={copiarCodigo}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl">
        {copiaCola ?? "Código PIX não disponível."}
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