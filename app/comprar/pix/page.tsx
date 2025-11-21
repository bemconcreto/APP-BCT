"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabaseClient";

export default function PixCheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copiaCola, setCopiaCola] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function gerarPixAutomatico() {
      try {
        const { data: session } = await supabase.auth.getSession();
        const user = session?.session?.user;

        if (!user) {
          setErro("Faça login novamente.");
          setLoading(false);
          return;
        }

        const cpfCnpj =
          user.user_metadata?.cpf ||
          user.user_metadata?.cpfCnpj ||
          user.user_metadata?.documento ||
          "";

        if (!cpfCnpj) {
          setErro("Seu CPF não foi encontrado.");
          setLoading(false);
          return;
        }

        // PEGAR ÚLTIMO VALOR DO LOCALSTORAGE (setado na página comprar)
        const valor = localStorage.getItem("BCT_valor_pix");

        if (!valor || Number(valor) <= 0) {
          setErro("Valor inválido.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/asaas/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountBRL: Number(valor),
            cpfCnpj,
            user_id: user.id,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          setErro("Erro ao gerar PIX.");
          setLoading(false);
          return;
        }

        setQrCode(data.qrCode);
        setCopiaCola(data.copiaCola);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setErro("Erro inesperado.");
        setLoading(false);
      }
    }

    gerarPixAutomatico();
  }, []);

  function copiarCodigo() {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-200 text-red-800 px-6 py-4 rounded">{erro}</div>
      </div>
    );
  }

  if (loading || !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Gerando PIX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Pagamento via PIX</h1>

      <img src={qrCode} alt="QR Code" className="w-64 h-64 mb-6" />

      <button
        onClick={copiarCodigo}
        className="bg-green-600 text-white px-6 py-3 rounded-lg mb-4"
      >
        {copiado ? "COPIADO!" : "Copiar código PIX"}
      </button>

      <p className="text-gray-700 text-center break-all max-w-xl mb-10">
        {copiaCola}
      </p>

      <button
        onClick={() => router.push("/comprar")}
        className="bg-gray-200 px-5 py-2 rounded hover:bg-gray-300"
      >
        Voltar
      </button>
    </div>
  );
}