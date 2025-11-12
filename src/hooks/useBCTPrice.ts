"use client";

import { useState, useEffect } from "react";
import { JsonRpcProvider, Contract } from "ethers";

// ✅ Endereço do contrato do BCT (Polygon)
const BCT_CONTRACT = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";

// ✅ ABI mínima apenas com a função que retorna preço (ajuste se necessário)
const BCT_ABI = [
  "function getLatestPrice() public view returns (uint256)"
];

export function useBCTPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        // ✅ Conexão com a Polygon Mainnet
        const provider = new JsonRpcProvider("https://polygon-rpc.com");

        // ✅ Inicializa contrato
        const contract = new Contract(BCT_CONTRACT, BCT_ABI, provider);

        // ✅ Chama a função de preço
        const rawPrice = await contract.getLatestPrice();

        // ✅ Converte pra número decimal
        const formattedPrice = Number(rawPrice) / 1e8; // exemplo: 8 casas decimais

        setPrice(formattedPrice);
      } catch (err) {
        console.error("Erro ao obter preço do BCT:", err);
        setPrice(null);
      }
    }

    fetchPrice();
  }, []);

  return price;
}