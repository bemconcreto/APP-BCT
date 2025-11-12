"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// contrato BCT
const BCT_ADDRESS = "0xaf2bccf3fb32f0fdeda650f6feff4cb9f3fb8098";

// ABI mínima para ler preço (getter price())
const ABI = [
  "function price() external view returns (uint256)"
];

export function useBCTPrice() {
  const [usd, setUsd] = useState<number | null>(null);
  const [brl, setBrl] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPrice() {
    try {
      const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

      const contract = new ethers.Contract(BCT_ADDRESS, ABI, provider);

      // preço em USD retornado pelo contrato (8 casas decimais)
      const rawPrice = await contract.price();

      const priceUsd = Number(rawPrice) / 1e8;
      const usdBrl = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL")
        .then(res => res.json())
        .then(d => Number(d.USDBRL.bid));

      setUsd(priceUsd);
      setBrl(priceUsd * usdBrl);
    } catch (err) {
      console.error("Erro ao carregar preço BCT:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrice();
  }, []);

  return { usd, brl, loading };
}