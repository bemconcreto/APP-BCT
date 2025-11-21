"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PixPage() {
  const params = useSearchParams();
  const pedido = params.get("pedido");

  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPix() {
      if (!pedido) {
        setErro("Dados não encontrados.");
        return;
      }

      try {
        const res = await fetch(`/api/asaas/pix/status?id=${pedido}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Erro inesperado.");
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
      } catch (e) {
        setErro("Erro inesperado.");
      }
    }

    carregarPix();
  }, [pedido]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

      {erro && <p className="bg-red-200 text-red-800 p-3">{erro}</p>}

      {!erro && !qrCode && (
        <p className="text-gray-700">Carregando dados do pagamento...</p>
      )}

      {qrCode && (
        <div className="text-center mt-6">
          <img src={qrCode} className="w-64 mx-auto" />
          <p className="bg-gray-100 p-3 mt-4 break-all">{copiaCola}</p>
        </div>
      )}
    </div>
  );
}