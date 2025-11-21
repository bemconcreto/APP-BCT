"use client";

import { useEffect, useState } from "react";

export default function PixCheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregar() {
      setLoading(true);

      try {
        const dados = JSON.parse(sessionStorage.getItem("BCT_PIX_DATA") || "{}");

        if (!dados?.id) {
          setErro("Dados do PIX não encontrados.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/pix/status?id=${dados.id}`);
        const data = await res.json();

        if (!data.success) {
          setErro("Erro ao carregar PIX.");
          setLoading(false);
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
      } catch (e) {
        setErro("Erro inesperado.");
      }

      setLoading(false);
    }

    carregar();
  }, []);

  function copiar() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="bg-red-200 text-red-700 px-6 py-3 rounded">{erro}</p>
      </div>
    );
  }

  if (loading || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-xl">Carregando PIX...</p>
      </div>
    );
  }

  return (
    <div class