"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function ExtratoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadExtrato();
  }, []);

  async function loadExtrato() {
    setLoading(true);
    setMsg("");

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        setMsg("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/extrato", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json.success) {
        setMsg("Erro ao carregar extrato.");
      } else {
        setItems(json.extrato);
      }
    } catch (e) {
      setMsg("Erro ao conectar com o servidor.");
    }

    setLoading(false);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Extrato</h1>

        {msg && <p className="text-red-600 mb-4 text-center">{msg}</p>}

        {loading ? (
          <p className="text-center">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-gray-600 text-center">Nenhuma movimentação encontrada.</p>
            )}

            {items.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 shadow-sm bg-gray-50"
              >
                <p className="font-bold text-lg">{item.tipo}</p>

                {item.tokens !== null && (
                  <p>Tokens: {item.tokens}</p>
                )}

                <p>Valor: R$ {item.valor.toFixed(2)}</p>
                <p>Status: {item.status}</p>
                <p className="text-sm text-gray-600">
                  Data: {formatDate(item.data)}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link href="/">
          <span className="block text-center text-gray-600 underline mt-6 cursor-pointer">
            Voltar ao painel
          </span>
        </Link>
      </div>
    </div>
  );
}