export default function PixConfirmado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-10 text-center max-w-md w-full">

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✔ PIX Confirmado!
        </h1>

        <p className="text-gray-700 mb-6 text-lg">
          Seu pagamento foi processado com sucesso.
        </p>

        <a
          href="/inicio"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg block"
        >
          Voltar ao início
        </a>

      </div>
    </div>
  );
}