"use client";

import { useBCTPrice } from "@/hooks/useBCTPrice";
import { useState, useEffect } from "react";

export default function TestePrecoPage() {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const value = await useBCTPrice();
        setPrice(value);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido ao buscar preço");
      }
    }
    fetchPrice();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-8">
      <h1 className="text-3xl font-bold mb-4 text-[#0C3D2E]">
        Teste de Preço do BCT
      </h1>

      {error && (
        <p className="text-red-600 mb-2">
          ⚠️ Erro ao carregar preço: {error}
        </p>
      )}

      {price ? (
        <p className="text-xl text-green-600 mb-2">
          💰 1 BCT ≈ {price.toFixed(4)} USD
        </p>
      ) : (
        <p className="text-gray-500">Carregando preço do token...</p>
      )}
    </div>
  );
}