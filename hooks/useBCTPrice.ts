"use client";

import { useEffect, useState } from "react";

export default function useBCTPrice() {
  const [usd, setUsd] = useState<number | null>(null);
  const [brl, setBrl] = useState<number | null>(null);
  const [variation, setVariation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPrice() {
    try {
      const res = await fetch("/api/preco-bct", { cache: "no-store" });
      const data = await res.json();

      setUsd(data.usd);
      setBrl(data.brl);
      setVariation(Number(data.variation24h));
    } catch (err) {
      console.error("Erro ao buscar preço do BCT:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrice();
  }, []);

  return { usd, brl, variation, loading, refresh: loadPrice };
}