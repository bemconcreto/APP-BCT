"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PagamentoPixPage() {
  const params = useSearchParams();
  const paymentId = params.get("pedido"); // vem da URL ?pedido=xxxx

  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/asaas/status/${paymentId}`);
        const data = await res.json();

        if (data.status) {
          setStatus(data.status);

          if (data.status === "RECEIVED" || data.status === "CONFIRMED") {
            // Redireciona para tela de PIX confirmado
            window.location.href = "/comprar/pix-confirmado";
          }
        }
      } catch (err) {
        console.error("Erro checando status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg text-center">

        <h1 className="text-3xl font-bold mb-4 text-blue-600">
          Aguardando pagamento PIX...
        </h1>

        <p className="text-gray-700 mb-6">
          Assim que o seu PIX for confirmado pela Asaas, seu saldo será atualizado automaticamente.
        </p>

        <div className="p-4 bg-gray-50 rounded-lg border mb-6">
          <p className="font-medium">
            Status atual:{" "}
            <span className="text-blue-700 font-bold">{status}</span>
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          Esta página atualiza automaticamente a cada 3 segundos.
        </p>
      </div>
    </div>
  );
}