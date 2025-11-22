"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [erro, setErro] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregarPIX() {
      if (!pedidoId) {
        setErro("Pedido não encontrado.");
        return;
      }

      try {
        const res = await fetch(`/api/pix/status?id=${pedidoId}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Erro ao carregar o PIX.");
          return;
        }

        if (!data.copiaCola) {
          setErro("Código PIX indisponível.");
          return;
        }

        setCopiaCola(data.copiaCola);
      } catch (e) {
        setErro("Erro ao carregar o PIX.");
      }

      setCarregando(false);
    }

    carregarPIX();
  }, [pedidoId]);

  function copiarCodigo() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="bg-red-200 text-red-800 px-6 py-3 rounded">{erro}</p>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando código PIX...</p>
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
        {copiaCola}
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