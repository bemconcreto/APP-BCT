"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";

export default function ExtratoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadExtrato();
  }, []);

  async function loadExtrato() {
    setMsg("");

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;

    if (!token) {
      setMsg("Usuário não autenticado.");
      return;
    }

    const res = await fetch("/api/extrato", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!json.success) {
      setMsg("Erro ao carregar extrato.");
      return;
    }

    setItems(json.extrato);
  }

  function colorStatus(s: string) {
    if (s === "completed") return "text-green-600";
    if (s === "pending") return "text-yellow-600";
    return "text-red-600"; // cancelled
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Extrato</h1>

        {msg && <p className="text-red-600 mb-4">{msg}</p>}

        {items.length === 0 && (
          <p className="text-gray-500 text-center">Nenhuma movimentação.</p>
        )}

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between">
                <span className="font-bold capitalize">{item.tipo}</span>
                <span className={`${colorStatus(item.status)} font-semibold`}>
                  {item.status}
                </span>
              </div>

              <p className="mt-2">
                <strong>Valor:</strong> R$ {item.valor.toFixed(2)}
              </p>

              {item.tokens !== null && (
                <p>
                  <strong>Tokens:</strong> {item.tokens}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-2">
                {new Date(item.data).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}