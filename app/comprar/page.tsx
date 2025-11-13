"use client";

import Link from "next/link";

export default function ComprarPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Comprar BCT
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Escolha a forma de pagamento para adquirir seus tokens.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <Link href="/comprar/transak">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">Cartão (Transak)</h2>
              <p className="mt-2 text-sm text-blue-100">Compra instantânea</p>
            </div>
          </Link>

          <Link href="/comprar/pix">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 cursor-pointer text-center">
              <h2 className="text-xl font-semibold">PIX</h2>
              <p className="mt-2 text-sm text-green-100">Pagamento por Pix</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}