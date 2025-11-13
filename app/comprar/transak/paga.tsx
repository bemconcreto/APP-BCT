"use client";

export default function TransakPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Comprar via Cartão (Transak)
        </h1>

        <p className="text-gray-700 mb-6">
          Você será redirecionado para a Transak para completar sua compra.
        </p>

        <a
          href="https://global.transak.com"
          target="_blank"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
        >
          Abrir Transak
        </a>
      </div>
    </div>
  );
}