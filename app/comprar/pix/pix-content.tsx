"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");

  const [erro, setErro] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!pedidoId) {
      setErro("ID do PIX não encontrado.");
      return;
    }

    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status?id=${pedidoId}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Erro ao carregar o PIX.");
          clearInterval(interval);
          return;
        }

        // Atualiza o copia e cola
        if (data.copiaCola) setCopiaCola(data.copiaCola);

        // 👇 SE PAGOU → REDIRECIONA AUTOMATICAMENTE
        if (data.status === "CONFIRMED") {
          clearInterval(interval);
          window.location.href = "/inicio";
        }
      } catch (e) {
        clearInterval(interval);
        setErro("Erro ao carregar o PIX.");
      }
    }, 3000);

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