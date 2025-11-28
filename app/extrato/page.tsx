"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import Link from "next/link";

export default function ExtratoPage() {
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    carregarExtrato();
  }, []);

  async function carregarExtrato() {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.success) {
        setMsg("Erro ao carregar extrato.");
        setItens([]);
      } else {
        setItens(json.extrato || []);
      }
    } catch (e) {
      console.error(e);
      setMsg("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Extrato</h1>

        {msg && <p className="text-red-600 mb-4">{msg}</p>}

        <button
          onClick={carregarExtrato}
          className="w-full bg-[#0C3D2E] text-white py-3 rounded-lg mb-6"
        >
          Atualizar
        </button>

        {loading && <p className="text-center">Carregando...</p>}

        {!loading && itens.length === 0 && (
          <p className="text-center text-gray-600">Sem registros por enquanto.</p>
        )}

        <div className="space-y-4">
          {itens.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <p><b>Tipo:</b> {item.tipo}</p>
              <p><b>Valor:</b> R$ {Number(item.valor).toFixed(2)}</p>
              <p><b>Data:</b> {new Date(item.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <Link href="/">
          <span className="block text-center text-gray-600 underline mt-6 cursor-pointer">
            Voltar ao painel
          </span>
        </Link>
      </div>
    </div>
  );
}