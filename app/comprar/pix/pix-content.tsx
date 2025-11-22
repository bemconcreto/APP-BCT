"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PixContent() {
  const searchParams = useSearchParams();

  const qrCode = searchParams.get("qr");
  const copiaCola = searchParams.get("copia");
  
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    if (!copiaCola) return;
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (!qrCode || !copiaCola) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="bg-red-200 text-red-700 px-6 py-3 rounded">
          QR Code não disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img src={qrCode} alt="QR Code" className="w-64 h-64 mb-6" />

      <button
        onClick={copiar}
        className="bg-green-600 text-white px-6 py-3 rounded mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-800 text-center break-all max-w-xl">{copiaCola}</p>

      <a
        href="/comprar"
        className="mt-10 inline-block bg-gray-200 px-5 py-2 rounded"
      >
        Voltar
      </a>
    </div>
  );
}