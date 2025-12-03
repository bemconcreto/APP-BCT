"use client";

import Link from "next/link";

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Transparência
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Acompanhe a divisão das subcontas do ecossistema BCT.
        </p>

        {/* GRID DAS SUBCONTAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* CONTA PRINCIPAL */}
          <div className="bg-gray-50 border rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold text-[#101820] mb-3 text-center">
              Conta Principal — 100%
            </h2>
            <img
              src="/transparencia/principal.PNG"
              className="rounded-xl w-full"
              alt="Conta Principal"
            />
          </div>

          {/* RESERVA */}
          <div className="bg-gray-50 border rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold text-[#CBA35C] mb-3 text-center">
              Reserva — 20%
            </h2>
            <img
              src="/transparencia/reserva.PNG"
              className="rounded-xl w-full"
              alt="Subconta Reserva"
            />
          </div>

          {/* LIQUIDEZ */}
          <div className="bg-gray-50 border rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold text-[#8D6E63] mb-3 text-center">
              Liquidez — 30%
            </h2>
            <img
              src="/transparencia/liquidez.PNG"
              className="rounded-xl w-full"
              alt="Subconta Liquidez"
            />
          </div>

          {/* IMÓVEIS */}
          <div className="bg-gray-50 border rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold text-[#4C3B34] mb-3 text-center">
              Imóveis — 30%
            </h2>
            <img
              src="/transparencia/imoveis.PNG"
              className="rounded-xl w-full"
              alt="Subconta Imóveis"
            />
          </div>

          {/* CUSTOS */}
          <div className="bg-gray-50 border rounded-xl p-4 shadow sm:col-span-2">
            <h2 className="text-xl font-bold text-red-600 mb-3 text-center">
              Custos — 20%
            </h2>
            <img
              src="/transparencia/custos.PNG"
              className="rounded-xl w-full"
              alt="Subconta Custos"
            />
          </div>

        </div>

        <div className="text-center mt-10">
          <Link href="/">
            <span className="text-gray-600 underline cursor-pointer">
              Voltar ao painel
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}