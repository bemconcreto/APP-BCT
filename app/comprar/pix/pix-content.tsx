"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const router = useRouter();

  const [erro, setErro] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  async function atualizarSaldo() {
    try {
      const res = await fetch("/api/wallet/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: pedidoId }),
      });

      console.log("Saldo atualizado:", await res.json());
    } catch (e) {
      console.log("Erro ao atualizar saldo:", e);
    }
  }

  async function verificarStatus() {
    try {
      const res = await fetch(`/api/pix/status?id=${pedidoId}`);
      const data = await res.json();

      if (!data.success) return;

      setCopiaCola(data.copiaCola || "");

      // 🟢 PAGAMENTO CONFIRMADO
      if (data.status === "CONFIRMED") {
        await atualizarSaldo();

        // redireciona automático
        router.push("/inicio#");
      }
    } catch (e) {
      setErro("Erro ao verificar pagamento.");
    }
  }

  useEffect(() => {
    if (!pedidoId) {
      setErro("ID do PIX não encontrado.");
      return;
    }

    let interval = setInterval(verificarStatus, 3000);
    verificarStatus();

    setLoading(false);

    return () => clearInterval(interval);
  }, [pedidoId]);

  function copiarCodigo() {
    if (copiaCola) {
      navigator.clipboard.writeText(copiaCola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Carregando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <button
        onClick={copiarCodigo}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl">
        {copiaCola || "Código PIX não disponível."}
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