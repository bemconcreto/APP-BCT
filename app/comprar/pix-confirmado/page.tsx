export default function PixConfirmado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white shadow-xl rounded-xl p-8 text-center">
        
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✔ PIX Confirmado!
        </h1>

        <p className="text-gray-700 mb-6">
          Seu pagamento foi processado com sucesso.
        </p>

        <a
          href="/inicio"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}