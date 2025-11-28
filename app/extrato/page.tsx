// app/extrato/page.tsx
"use client";

import { useEffect, useState } from "react";

type ExtratoItem = {
  id: string;
  kind: string;
  title: string;
  amount: number;
  status?: string;
  created_at: string;
  meta?: any;
};

export default function ExtratoPage() {
  const [items, setItems] = useState<ExtratoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadExtrato();
  }, []);

  async function loadExtrato() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/extrato", { cache: "no-store" });
      const j = await res.json();
      if (!j.success) {
        setMsg("Erro ao carregar extrato.");
        setItems([]);
      } else {
        setItems(j.items ?? []);
      }
    } catch (e) {
      console.error(e);
      setMsg("Erro ao conectar com servidor.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function fmtMoney(v?: number) {
    if (v === null || v === undefined) return "-";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function fmtDate(s?: string) {
    if (!s) return "-";
    try {
      return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return s;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Extrato</h1>

        <div className="mb-4">
          <button
            onClick={loadExtrato}
            className="bg-[#0C3D2E] text-white px-4 py-2 rounded mr-3"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>

        {msg && <p className="text-red-600 mb-4">{msg}</p>}

        {items.length === 0 && !loading ? (
          <p className="text-gray-600">Sem registros por enquanto.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="p-4 border rounded flex justify-between items-start">
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm text-gray-600">
                    {fmtDate(it.created_at)} •{" "}
                    <span className={`font-medium ${it.status === "pending" ? "text-yellow-600" : it.status === "completed" ? "text-green-600" : "text-gray-600"}`}>
                      {it.status ?? "—"}
                    </span>
                  </div>
                  {/* detalhes rápidos */}
                  {it.kind === "venda" && (
                    <div className="text-sm text-gray-700 mt-2">
                      Tokens liquidos: {it.meta?.raw?.tokens_liquidos ?? it.meta?.raw?.tokens_net ?? "-"} • Fee: {it.meta?.raw?.taxa_brl ?? "-"}
                    </div>
                  )}
                  {it.kind === "saque" && (
                    <div className="text-sm text-gray-700 mt-2">Chave PIX: {it.meta?.raw?.chave_pix ?? it.meta?.raw?.pix_key ?? "-"}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-semibold">{fmtMoney(it.amount)}</div>
                  <div className="text-sm text-gray-600">{it.kind.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}