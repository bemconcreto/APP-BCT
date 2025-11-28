"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

// 🔵 Converte o status do banco para o texto final
function formatStatus(status: string) {
  switch (status) {
    case "completed":
      return { label: "CONFIRMADO", color: "text-green-600" };
    case "pending":
      return { label: "PROCESSANDO", color: "text-yellow-600" };
    case "cancelled":
      return { label: "CANCELADO", color: "text-red-600" };
    default:
      return { label: status, color: "text-gray-600" };
  }
}

export default function ExtratoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExtrato();
  }, []);

  async function loadExtrato() {
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;

    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Buscar extratos: compras + vendas
    const res = await fetch("/api/extrato", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (json.success) {
      setItems(json.data);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">Extrato</h1>

        {loading && <p className="text-center">Carregando...</p>}

        {!loading && items.length === 0 && (
          <p className="text-center text-gray-500">Nenhuma movimentação encontrada.</p>
        )}

        {!loading &&
          items.map((item, i) => {
            const fmt = formatStatus(item.status);

            return (
              <div
                key={i}
                className="border rounded-xl p-5 mb-4 bg-gray-50 shadow-sm"
              >
                <h2 className="text-xl font-bold mb-2">
                  {item.tipo === "venda" ? (
                    <span className="text-red-600">Venda</span>
                  ) : (
                    <span className="text-green-600">Compra</span>
                  )}
                </h2>

                {/* Tokens */}
                {item.tokens && (
                  <p className="text-gray-800">
                    Tokens: <strong>{item.tokens}</strong>
                  </p>
                )}

                {/* Valor */}
                <p className="text-gray-800">
                  Valor: <strong>R$ {Number(item.valor).toFixed(2)}</strong>
                </p>

                {/* STATUS */}
                <p className={`mt-1 font-semibold ${fmt.color}`}>
                  Status: {fmt.label}
                </p>

                {/* DATA */}
                <p className="text-sm text-gray-600 mt-1">
                  {item.data_formatada}
                </p>
              </div>
            );
          })}

        <Link href="/" className="block text-center mt-6 underline text-gray-600">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}