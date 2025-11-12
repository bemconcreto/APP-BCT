"use client";

import { useState, useEffect } from "react";

export default function ComprarPage() {
  const [price, setPrice] = useState<number | null>(null);
  const [usdBrl, setUsdBrl] = useState<number | null>(null);
  const [amountBRL, setAmountBRL] = useState(50);

  useEffect(() => {
    fetch("/api/price").then(r => r.json()).then(j => setPrice(j.priceUSD));
    fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL")
      .then(r => r.json())
      .then(j => setUsdBrl(j.rates.BRL));
  }, []);

  const valorBCT = ((amountBRL / (price || 0.5)) / (usdBrl || 5.3)).toFixed(2);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Comprar BCT</h1>
      <p className="text-gray-600 mb-6">
        Cotação atual: <b>{price ? `$${price.toFixed(3)}` : "Carregando..."}</b> | USD/BRL:{" "}
        <b>{usdBrl ? `R$${usdBrl.toFixed(2)}` : "Carregando..."}</b>
      </p>

      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valor em reais (R$)
        </label>
        <input
          type="number"
          value={amountBRL}
          onChange={e => setAmountBRL(Number(e.target.value))}
          className="border w-full rounded-md p-2 mb-4"
        />
        <p className="text-sm text-gray-600 mb-4">
          Você receberá aproximadamente <b>{valorBCT}</b> BCT
        </p>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md w-full font-semibold">
          Comprar com Cartão 💳
        </button>
      </div>
    </main>
  );
}