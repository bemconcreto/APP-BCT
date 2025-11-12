"use client";

import Link from "next/link";

export default function InicioPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        import Link from "next/link";

// dentro do return
<Link href="/inicio">
  <h1 className="text-xl font-bold text-green-700 cursor-pointer hover:text-green-800 transition-colors">
    Bem Concreto Token
  </h1>
</Link>
        <p className="text-center text-gray-600 mb-10">
          Selecione uma das opções abaixo para gerenciar seus investimentos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/imoveis">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Imóveis</h2>
              <p className="mt-2 text-sm text-green-100">Ver imóveis tokenizados</p>
            </div>
          </Link>

          <Link href="/comprar">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Comprar</h2>
              <p className="mt-2 text-sm text-blue-100">Adquirir tokens BCT</p>
            </div>
          </Link>

          <Link href="/vender">
            <div className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Vender</h2>
              <p className="mt-2 text-sm text-yellow-100">Negociar seus tokens</p>
            </div>
          </Link>

          <Link href="/extrato">
            <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Extrato</h2>
              <p className="mt-2 text-sm text-indigo-100">Acompanhar histórico</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}