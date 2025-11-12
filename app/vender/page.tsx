"use client";

import { useState } from "react";

export default function VenderPage() {
  const [amountBCT, setAmountBCT] = useState(100);
  const precoBRL = (amountBCT * 0.50 * 5.3).toFixed(2);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Vender BCT</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade de BCT
        </label>
        <input
          type="number"
          value={amountBCT}
          onChange={e => setAmountBCT(Number(e.target.value))}
          className="border w-full rounded-md p-2 mb-4"
        />
        <p className="text-sm text-gray-600 mb-4">
          Valor estimado a receber: <b>R$ {precoBRL}</b>
        </p>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md w-full font-semibold">
          Vender via PIX 💸
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Pagamento em até 24h úteis.
        </p>
      </div>
    </main>
  );
}
