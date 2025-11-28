"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function ExtratoPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
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
        headers: { Authorization: `Bearer ${token}` }
      });

      const j = await res.json();

      if (!j.success) {
        setMsg("Erro ao carregar extrato.");
        setLoading(false);
        return;
      }

      const lista: any[] = [];

      // 🔥 Formatar vendas
      j.vendas.forEach((v: any) => {
        lista.push({
          tipo: "Venda",
          tokens: v.tokens_solicitados,
          valor: v.valor_liquido_brl ?? v.valor_brl ?? 0,
          status: v.status,
          data: v.created_at
        });
      });

      // 🔥 Formatar compras
      j.compras.forEach((c: any) => {
        lista.push({
          tipo: "Compra",
          tokens: c.tokens,
          valor: c.valor_total_brl,
          status: c.status,
          data: c.created_at
        });
      });

      // 🔥 Formatar saques
      j.saques.forEach((s: any) => {
        lista.push({
          tipo: "Saque",
          tokens: null,
          valor: s.valor,
          status: s.status,
          data: s.created_at
        });
      });

      // 🔥 Ordenar tudo por data
      lista.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );

      setItems(lista);

    } catch (err) {
      setMsg("Erro ao conectar com o servidor.");
    }

    setLoading(false);
  }

  function formatDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString("pt-BR") + " — " + dt.toLocaleTimeString("pt-BR");
  }

  function statusColor(status: string) {
    if (status === "Confirmado" || status === "confirmado") return "text-green-600";
    if (status === "Processando" || status === "processando") return "text-yellow-600";
    return "text-red-600";
  }

  function tipoColor(tipo: string) {
    if (tipo === "Compra") return "text-green-700";
    if (tipo === "Venda" || tipo === "Saque") return "text-red-700";
    return "text-gray-800";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Extrato</h1>

        {msg && <p className="text-red-600 mb-4 text-center">{msg}</p>}

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {items.map((i, idx) => (
              <div key={idx} className="border p-4 rounded-lg bg-gray-50">
                <p className={`text-lg font-bold ${tipoColor(i.tipo)}`}>
                  {i.tipo}
                </p>

                {i.tokens && (
                  <p className="text-gray-700">Tokens: {i.tokens}</p>
                )}

                <p className="text-gray-700">
                  Valor: <b>R$ {Number(i.valor).toFixed(2)}</b>
                </p>

                <p className={`font-semibold ${statusColor(i.status)}`}>
                  Status: {i.status}
                </p>

                <p className="text-gray-600 text-sm mt-1">
                  {formatDate(i.data)}
                </p>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-center text-gray-500">Nenhuma operação encontrada.</p>
            )}
          </div>
        )}

        <Link href="/">
          <p className="mt-6 text-center text-gray-700 underline cursor-pointer">
            Voltar ao painel
          </p>
        </Link>
      </div>
    </div>
  );
}