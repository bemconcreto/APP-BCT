"use client";
import { useBCTPrice } from "@/hooks/useBCTPrice";

export default function TestePrecoPage() {
  const { tokenToWmatic, tokenUSD, error } = useBCTPrice();

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

      {tokenUSD ? (
        <>
          <p className="text-xl text-green-600 mb-2">
            💰 1 BCT ≈ {tokenUSD.toFixed(4)} USD
          </p>
          <p className="text-md text-gray-600">
            (Equivalente a {tokenToWmatic?.toFixed(6)} MATIC)
          </p>
        </>
      ) : (
        <p className="text-gray-500">Carregando preço do token...</p>
      )}
    </div>
  );
}