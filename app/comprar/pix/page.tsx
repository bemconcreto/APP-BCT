"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PixPageContent() {
  const params = useSearchParams();
  const pedido = params.get("pedido");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          PIX Confirmado! ✅
        </h1>

        <p className="text-xl text-gray-800 mb-6">
          Seu pagamento foi recebido com sucesso.
        </p>

        <p className="text-gray-600 mb-8">
          ID do pedido: <strong>{pedido}</strong>
        </p>

        <a
          href="/inicio"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          Voltar ao painel
        </a>

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