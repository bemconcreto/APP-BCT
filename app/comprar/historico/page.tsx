"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Historico() {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/asaas/listar", { method: "GET" });
        const data = await res.json();
        setLista(data.items || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    carregar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-6">Histórico</h1>

        {loading && <p>Carregando...</p>}

        {!loading && lista.length === 0 && (
          <p className="text-center text-gray-600">Nenhuma compra encontrada.</p>
        )}

        <div className="mt-6 space-y-4">
          {lista.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded-lg shadow-sm bg-gray-50"
            >
              <p><strong>ID:</strong> {p.id}</p>
              <p><strong>Valor:</strong> R$ {p.value}</p>
              <p><strong>Status:</strong> {p.status}</p>
              <p><strong>Data:</strong> {p.dateCreated}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/comprar">
            <span className="underline text-gray-600 cursor-pointer">Voltar</span>
          </Link>
        </div>

      </div>
    </div>
  );
}