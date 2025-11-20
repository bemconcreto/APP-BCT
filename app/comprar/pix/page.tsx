"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PixPageContent() {
  const params = useSearchParams();
  const pedido = params.get("pedido");
  const qr = params.get("qr");

  if (!pedido || !qr) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold">Erro ao gerar PIX</h1>
        <p>Volte e tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">

        <h1 className="text-3xl font-bold mb-4">Aguardando PIX ⏳</h1>

        <p className="text-gray-700 mb-4">
          Escaneie o QR Code abaixo para pagar:
        </p>

        <img src={qr} alt="QR Code" className="w-full max-w-xs mx-auto mb-6" />

        <p className="text-gray-700 mb-2">
          ID do pedido: <strong>{pedido}</strong>
        </p>

        <p className="text-gray-500">A confirmação ocorre automaticamente.</p>

      </div>
    </div>
  );
}

export default function PixPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <PixPageContent />
    </Suspense>
  );
}