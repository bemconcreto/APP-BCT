"use client";

import { useState, useEffect } from "react";

export default function PixCheckoutPage() {
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [valor, setValor] = useState<string | null>(null);
  const [cpf, setCpf] = useState<string | null>(null);

  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  // ==========================================
  //   LER PARAMETROS DA URL (SEM SearchParams)
  // ==========================================
  useEffect(() => {
    const url = new URL(window.location.href);
    setPedidoId(url.searchParams.get("pedido"));
    setValor(url.searchParams.get("valor"));
    setCpf(url.searchParams.get("cpf"));
  }, []);

  // ==========================================
  //   CARREGAR STATUS DO PIX
  // ==========================================
  useEffect(() => {
    if (!pedidoId) return;

    async function loadPix() {
      try {
        const res = await fetch(`/api/asaas/pix/status?id=${pedidoId}`);

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

    loadPix();
  }, [pedidoId]);

  // ==========================================
  //   COPIAR CODIGO
  // ==========================================
  function copiarCodigo() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  // ==========================================
  //   TELAS DE ERRO / LOADING
  // ==========================================
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
        <p className="text-gray-700 text-lg">Gerando PIX...</p>
      </div>
    );
  }

  // ==========================================
  //   TELA FINAL — QR CODE + COPIA/COLA
  // ==========================================
  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img
        src={qrCode}
        alt="QR Code"
        className="w-64 h-64 mb-6 rounded-lg shadow"
      />

      <button
        onClick={copiarCodigo}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl mb-10">
        {copiaCola}
      </p>

      <a
        href="/comprar"
        className="inline-block bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
      >
        Voltar
      </a>
    </div>
  );
}