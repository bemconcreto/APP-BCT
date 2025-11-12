import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Hook React para buscar o preço do Bem Concreto Token (BCT)
export function useBCTPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        // Conecta à blockchain Polygon
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");

        // Contrato do BCT (Polygon)
        const contract = new ethers.Contract(
          "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098",
          [
            // Substitui essa função pela que realmente existe no teu contrato (exemplo genérico)
            "function getLatestPrice() public view returns (int)"
          ],
          provider
        );

        // Tenta buscar o preço
        const result = await contract.getLatestPrice();
        setPrice(Number(result) / 1e8);
      } catch (error) {
        console.error("Erro ao buscar preço BCT:", error);
      }
    }

    fetchPrice();

    // Atualiza o preço a cada 15 segundos
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  return price;
}