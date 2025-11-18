"use client";

import { useEffect, useState } from "react";

export default function PixPage() {
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [copiaECola, setCopiaECola] = useState("");
  const [valor, setValor] = useState(0);

  useEffect(() => {
    async function load() {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("pedido");

      if (!id) {
        alert("ID do pedido não encontrado.");
        return;
      }

      try {
        const res = await fetch(`/api/pix/status?id=${id}`);
        const data = await res.json();

        if (!data.success) {
          alert("Erro ao carregar PIX");
          return;
        }

        setQrCode(data.qrCodeBase64);
        setCopiaECola(data.copiaECola);
        setValor(data.value);
      } catch (e) {
        alert("Erro inesperado");
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Carregando PIX...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">

        <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

        <p className="text-gray-700 mb-2">
          Valor: <strong>R$ {valor.toFixed(2)}</strong>
        </p>

        {/* QR CODE */}
        {qrCode && (
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code Pix"
            className="mx-auto w-64 h-64 mb-4 border rounded-lg"
          />
        )}

        {/* COPIA E COLA */}
        <div className="mt-4">
          <label className="text-gray-600 text-sm">PIX Copia e Cola</label>
          <textarea
            className="w-full p-3 border rounded-lg text-sm mt-1"
            rows={3}
            readOnly
            value={copiaECola}
          />

          <button
            onClick={() => navigator.clipboard.writeText(copiaECola)}
            className="w-full bg-green-600 text-white py-3 mt-3 rounded-lg hover:bg-green-700"
          >
            Copiar código PIX
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Aguarde, o pagamento normalmente compensa em alguns segundos.
        </p>

      </div>
    </div>
  );
}