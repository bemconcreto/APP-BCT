"use client";

import { useState } from "react";

export default function PixPage() {
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copia, setCopia] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Pagamento via PIX</h1>

        {erro && (
          <p className="bg-red-200 text-red-800 px-4 py-2 rounded mb-4">
            {erro}
          </p>
        )}

        {!qrCode && !copia && (
          <p className="text-gray-600">
            Essa página é aberta automaticamente após gerar o PIX.
            <br />
            Caso tenha chegado aqui por engano, volte e gere o pagamento de
            novo.
          </p>
        )}

        {qrCode && (
          <div className="mt-6 text-center">
            <img src={qrCode} className="mx-auto w-64" />
            <p className="mt-4 break-all bg-gray-100 p-3 rounded">
              {copia}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}