"use client";

import { useEffect, useState } from "react";

export default function PixPage() {
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pedido = params.get("pedido");

    if (!pedido) {
      setErro("Dados não encontrados.");
      return;
    }

    // buscar do Asaas a cobrança
    fetch(`/api/asaas/pix-status?id=${pedido}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setErro("Erro ao buscar dados do PIX.");
          return;
        }

        setQrCode(data.qrCode);
        setCopia(data.copiaCola);
      })
      .catch(() => setErro("Erro inesperado."));
  }, []);

  if (erro) {
    return (
      <div className="p-6">
        <p className="bg-red-200 p-3">{erro}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

      {!qrCode && <p>Carregando...</p>}

      {qrCode && (
        <div className="text-center">
          <img src={qrCode} className="mx-auto w-64" />
          <p className="mt-4 break-all">{copia}</p>
        </div>
      )}
    </div>
  );
}