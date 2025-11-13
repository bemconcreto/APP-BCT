"use client";

import { useEffect, useState } from "react";

export default function AdminPagamentos() {
  const [payments, setPayments] = useState([]);

  const loadPayments = async () => {
    const response = await fetch("/api/pix/list");
    const data = await response.json();
    setPayments(data);
  };

  const confirmar = async (id: string) => {
    const ok = confirm("Confirmar pagamento?");
    if (!ok) return;

    const response = await fetch("/api/pix/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Pagamento confirmado e tokens enviados!");
      loadPayments();
    } else {
      alert("Erro ao confirmar pagamento.");
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Pagamentos PIX</h1>

      <div className="space-y-4">
        {payments.map((p: any) => (
          <div
            key={p.id}
            className="bg-white shadow-lg p-4 rounded-lg border"
          >
            <p><b>ID:</b> {p.id}</p>
            <p><b>Wallet:</b> {p.wallet}</p>
            <p><b>Valor:</b> R$ {p.amount.toFixed(2)}</p>
            <p><b>Status:</b> {p.status}</p>

            {p.status === "pending" && (
              <button
                className="mt-3 bg-green-700 text-white px-3 py-2 rounded-lg"
                onClick={() => confirmar(p.id)}
              >
                Confirmar Pagamento
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}