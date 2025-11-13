"use client";

export default function ExtratoPage() {
  const transacoes = [
    { tipo: "Compra BCT", valor: "+500", data: "09/11/2025", status: "✅ Confirmado" },
    { tipo: "Venda PIX", valor: "-250", data: "07/11/2025", status: "✅ Enviado" },
    { tipo: "Recompra", valor: "+100", data: "05/11/2025", status: "⏳ Pendente" },
  ];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Extrato</h1>
      <div className="bg-white rounded-lg shadow divide-y">
        {transacoes.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium text-gray-700">{t.tipo}</p>
              <p className="text-xs text-gray-500">{t.data}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${t.valor.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                {t.valor} BCT
              </p>
              <p className="text-xs text-gray-500">{t.status}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}