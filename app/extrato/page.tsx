"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";

export default function Extrato() {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setErro("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/extrato?token=${token}`);
      const json = await res.json();

      if (!json.success) {
        setErro(json.error);
      } else {
        setCompras(json.compras);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando extrato...</div>;
  }

  if (erro) {
    return (
      <div className="p-6 text-red-600">
        Erro no extrato: {erro}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Extrato de Compras</h1>

      {compras.length === 0 && (
        <p className="text-gray-600">Nenhuma transação encontrada.</p>
      )}

      <div className="flex flex-col gap-4">
        {compras.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 shadow-sm bg-white"
          >
            <p><b>Data:</b> {new Date(item.created_at).toLocaleString()}</p>
            <p><b>Tokens:</b> {item.tokens}</p>
            <p><b>Valor pago:</b> R$ {item.valor_pago}</p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={
                  item.status === "paid"
                    ? "text-green-600"
                    : item.status === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {item.status.toUpperCase()}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}