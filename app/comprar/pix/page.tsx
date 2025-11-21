"use client";

export default function PixPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pagamento via PIX
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed">
          Essa página é aberta automaticamente após gerar o PIX.
          <br />
          <br />
          Caso você tenha chegado aqui por engano, volte e gere o pagamento de
          novo.
        </p>

        <div className="text-center mt-10">
          <a
            href="/comprar"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Voltar para compra
          </a>
        </div>
      </div>
    </div>
  );
}