"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

function PixPageContent() {
  const params = useSearchParams();
  const paymentId = params.get("pedido");

  const [status, setStatus] = useState<"loading" | "pending" | "confirmed" | "error">("loading");

  useEffect(() => {
    if (!paymentId) {
      setStatus("error");
      return;
    }

    async function verificarStatus() {
      try {
        const res = await fetch(`/api/asaas/status/${paymentId}`);

        const data = await res.json();

        if (!data.success) {
          setStatus("pending");
          return;
        }

        if (data.status === "RECEIVED" || data.status === "CONFIRMED") {
          setStatus("confirmed");
          return;
        }

        // Ainda aguardando pagamento
        setStatus("pending");

      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    verificarStatus();
  }, [paymentId]);

  // ===============================
  // TELAS
  // ===============================

  if (status === "loading") {
    return <div className="p-8 text-center">Carregando status do pagamento...</div>;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Erro</h1>
          <p className="text-gray-700">Não foi possível verificar o pagamento.</p>
          <p className="mt-4 text-gray-500">ID: {paymentId}</p>
          <a href="/inicio" className="mt-6 inline-block bg-gray-600 text-white px-6 py-3 rounded-lg">
            Voltar ao painel
          </a>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4 text-yellow-600">Aguardando PIX ⏳</h1>
          <p className="text-gray-700">Estamos aguardando a confirmação do pagamento.</p>
          <p className="mt-4">ID do pedido: <strong>{paymentId}</strong></p>
          <p className="mt-2 text-sm text-gray-500">Isso pode levar alguns segundos...</p>
        </div>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4 text-green-700">PIX Confirmado! ✅</h1>
          <p className="text-gray-800 mb-6">Seu pagamento foi recebido com sucesso.</p>
          <p className="text-gray-600 mb-8">
            ID do pedido: <strong>{paymentId}</strong>
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
}

export default function PixPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <PixPageContent />
    </Suspense>
  );
}