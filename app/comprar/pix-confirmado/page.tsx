"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// evita pre-renderização do Next.js
export const dynamic = "force-dynamic";

function PixConfirmadoContent() {
  const params = useSearchParams();
  const pedido = params.get("pedido");

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 text-center max-w-md w-full">

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✔ PIX Confirmado!
        </h1>

        <p className="text-gray-700 mb-4 text-lg">
          Seu pagamento foi recebido com sucesso.
        </p>

        {pedido && (
          <p className="text-gray-600 mb-6">
            ID do pedido:<br />
            <strong className="break-all">{pedido}</strong>
          </p>
        )}

        <a
          href="/inicio"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg text-lg"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}

export default function PixConfirmado() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <PixConfirmadoContent />
    </Suspense>
  );
}