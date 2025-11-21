"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PixCheckoutPage() {
  const router = useRouter();

  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function gerarPix() {
      try {
        const res = await fetch("/api/asaas/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: sessionStorage.getItem("PIX_DATA")!, // <-- RECEBE OS DADOS DIRETO
        });

        const data = await res.json();

        if (!data.success) {
          alert("Erro ao gerar PIX.");
          router.push("/comprar");
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
      } catch (err) {
        alert("Erro inesperado.");
      }
    }

    gerarPix();
  }, []);

  function copiar() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-800 text-lg">Gerando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img src={qrCode} className="w-64 h-64 mb-6" />

      <button
        onClick={copiar}
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