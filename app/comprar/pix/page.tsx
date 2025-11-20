"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PixPageContent() {
  const params = useSearchParams();
  const pedido = params.get("pedido");
  const qr = params.get("qr");

  // Se não vier o pedido e o QR, mostra erro
  if (!pedido || !qr) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Erro ao gerar PIX</h1>
          <p>Volte e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-xl">

        <h1 className="text-3xl font-bold mb-4 text-yellow-700">
          Aguardando PIX ⏳
        </h1>

        <p className="text-gray-700 mb-4">
          Escaneie o QR Code abaixo para pagar:
        </p>

        <img
          src={qr}
          alt="QR Code PIX"
          className="w-full max-w-xs mx-auto mb-6 border rounded-xl shadow-sm"
        />

        <p className="text-gray-700 mb-2">
          ID do pedido: <strong>{pedido}</strong>
        </p>

        <p className="text-gray-500 text-sm">
          Assim que o pagamento for confirmado, você será redirecionado automaticamente.
        </p>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              setInterval(() => {
                fetch('/api/asaas/status/${pedido}')
                  .then(r => r.json())
                  .then(data => {
                    if (data?.status === 'paid') {
                      window.location.href = '/comprar/sucesso?id=${pedido}';
                    }
                  });
              }, 3000);
            `,
          }}
        />
      </div>
    </div>
  );
}

export default function PixPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Carregando...</p>}>
      <PixPageContent />
    </Suspense>
  );
}