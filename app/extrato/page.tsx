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
    } catch {
      setMsg("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  }

  function translateStatus(status: string) {
    if (!status) return "";

    switch (status.toLowerCase()) {
      case "completed":
        return "Confirmado";
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "processing":
        return "Processando";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">Extrato</h1>

        {msg && <p className="text-red-600 mb-4">{msg}</p>}
        {loading && <p>Carregando...</p>}

        {!loading && items.length === 0 && (
          <p className="text-gray-600 text-center">Nenhum lançamento encontrado.</p>
        )}

        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <p className="font-bold text-lg">{item.tipo}</p>

              <p className={`text-lg ${item.valor < 0 ? "text-red-600" : "text-green-700"}`}>
                Valor: R$ {item.valor.toFixed(2)}
              </p>

              <p className="text-gray-700">{item.info}</p>

              <p>
                Status: <b>{translateStatus(item.status)}</b>
              </p>

              <p className="text-gray-500 text-sm">
                {new Date(item.data).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>

        <Link href="/">
          <span className="block text-center mt-6 text-gray-600 underline cursor-pointer">
            Voltar ao painel
          </span>
        </Link>

      </div>
    </div>
  );
}