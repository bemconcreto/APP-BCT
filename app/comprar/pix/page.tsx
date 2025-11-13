"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixPagamentoPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadPedido() {
    if (!pedidoId) return;

    try {
      const res = await fetch(`/api/pix/confirmar?id=${pedidoId}`);
      const data = await res.json();
      setPedido(data);
    } catch (e) {
      console.error("Erro ao carregar pedido", e);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPedido();

    // atualizar status a cada 5s
    const interval = setInterval(() => {
      loadPedido();
    }, 5000);

    return () => clearInterval(interval);
  }, [pedidoId]);

  if (loading || !pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Carregando dados do PIX...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Pagamento via PIX
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Pague o valor abaixo e aguarde a confirmação.
        </p>

        <div className="text-center mb-6">
          <p className="text-lg">Valor:</p>
          <p className="text-3xl font-bold text-green-700">
            R$ {pedido.amount_brl.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4 text-center mb-6">
          <p className="font-bold text-gray-700">Chave PIX:</p>
          <p className="text-sm text-gray-800 break-all mt-1">
            742053f0-7437-4ec8-86af-48b2561f1999
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="font-semibold">Status:</p>
          <p
            className={`text-xl font-bold mt-1 ${
              pedido.status === "pago"
                ? "text-green-600"
                : pedido.status === "pendente"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {pedido.status.toUpperCase()}
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500">Após o pagamento, o sistema aprova e envia os tokens automaticamente.</p>
        </div>

      </div>
    </div>
  );
}