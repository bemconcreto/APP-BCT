"use client";

import Link from "next/link";

export default function SucessoPage({ searchParams }: any) {
  const id = searchParams?.id ?? "N/D";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101820]">
      <div className="bg-white rounded-xl shadow p-10 max-w-lg text-center">
        
        <h1 className="text-3xl font-bold text-[#CBA35C] mb-4">
          🎉 Pagamento Realizado!
        </h1>

        <p className="text-gray-700 mb-6">
          Seu pedido foi processado com sucesso.
        </p>

        <p className="font-semibold text-gray-800 mb-8">
          ID do Pagamento: <span className="text-[#CBA35C]">{id}</span>
        </p>

        <Link href="/comprar/historico">
          <span className="bg-[#101820] text-white px-6 py-3 rounded cursor-pointer hover:bg-[#101820]">
            Ver Histórico
          </span>
        </Link>

      </div>
    </div>
  );
}