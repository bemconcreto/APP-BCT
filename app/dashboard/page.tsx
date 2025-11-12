"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao buscar usuário:", error);
      } else {
        setUser(data?.user);
      }
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md p-8 rounded-xl w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 Bem-vindo ao Painel BCT</h1>

        {user ? (
          <>
            <p className="mb-2 text-gray-700">
              Você está logado como:
              <br />
              <strong>{user.email}</strong>
            </p>
            <p className="text-green-600 font-semibold">Login realizado com sucesso!</p>
          </>
        ) : (
          <p className="text-gray-500">Carregando informações do usuário...</p>
        )}
      </div>
    </div>
  );
}