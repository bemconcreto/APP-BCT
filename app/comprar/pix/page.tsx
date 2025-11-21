"use client";

import Link from "next/link";

export default function PixPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Pagamento via PIX
        </h1>

        <p className="text-gray-700 text-lg text-center leading-relaxed">
          Essa página é aberta automaticamente após gerar o PIX.
          <br /><br />
          Caso você tenha chegado aqui por engano, volte e gere o pagamento novamente.
        </p>

        <div className="text-center mt-8">
          <Link href="/comprar">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg">
              Voltar para compra
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}