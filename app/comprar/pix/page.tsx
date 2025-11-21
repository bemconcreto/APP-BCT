"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PixContent() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!pedido) {
        setErro("Dados não encontrados.");
        return;
      }

      try {
        const res = await fetch(
          `/api/asaas/pix/status?id=${pedido}`,
          { method: "GET" }
        );

        const data = await res.json();

        if (!data.success) {
          setErro("Erro inesperado.");
          return;
        }

        setQrCode(data.qrCode);
        setCopia(data.copiaCola);
      } catch (e) {
        console.error(e);
        setErro("Erro inesperado.");
      }
    }

    carregar();
  }, [pedido]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

      {erro && (
        <p className="bg-red-200 p-3 rounded mb-4">{erro}</p>
      )}

      {qrCode && (
        <div className="text-center mt-6">
          <img src={qrCode} className="mx-auto w-64" />
          <p className="mt-4 break-all">{copia}</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <PixContent />
    </Suspense>
  );
}