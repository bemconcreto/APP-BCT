"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// IMPORTA O WEB3AUTH (MESMO DO CADASTRO)
import { supabase } from "../../src/lib/supabaseClient"; // <- mesmo arquivo usado no cadastro

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIN SIMPLES COM EMAIL/SENHA (TEMPORÁRIO)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && senha) {
      router.push("/inicio");
    } else {
      alert("Por favor, preencha todos os campos");
    }
  };

  // --- LOGIN COM GOOGLE
  async function loginGoogle() {
    try {
      setLoading(true);
      await web3auth.connectTo("google"); // mesmo do cadastro
      router.push("/inicio");
    } catch (e) {
      alert("Erro ao entrar com Google");
      console.error(e);
    }
    setLoading(false);
  }

  // --- LOGIN COM WEB3AUTH (WALLET)
  async function loginWeb3Auth() {
    try {
      setLoading(true);
      await web3auth.connect(); // abre modal wallet/metamask/etc
      router.push("/inicio");
    } catch (e) {
      alert("Erro ao conectar carteira");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Entrar
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* SENHA */}
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* BOTÃO ENTRAR */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Entrar
        </button>

        {/* DIVISOR */}
        <div className="my-6 text-center text-gray-500 text-sm">
          ou
        </div>

        {/* BOTÃO GOOGLE */}
        <button
          type="button"
          onClick={loginGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-6 h-6"
            alt="Google"
          />
          Entrar com Google
        </button>

        {/* ESPAÇO */}
        <div className="h-3" />

        {/* BOTÃO WEB3AUTH */}
        <button
          type="button"
          onClick={loginWeb3Auth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/508686/wallet.svg"
            className="w-6 h-6"
            alt="Wallet"
          />
          Entrar com Web3Auth
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <a href="/cadastro" className="text-blue-600 font-medium hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
}