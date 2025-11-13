"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // -------------------------------------------------------
  // LOGIN TRADICIONAL
  // -------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("E-mail ou senha incorretos");
      return;
    }

    router.push("/inicio");
  };

  // -------------------------------------------------------
  // LOGIN GOOGLE
  // -------------------------------------------------------
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://app-bct.vercel.app/inicio" },
    });
    if (error) alert("Erro ao entrar com Google: " + error.message);
  }

  // -------------------------------------------------------
  // LOGIN WEB3AUTH  (MESMO CÓDIGO DO CADASTRO)
  // -------------------------------------------------------
  async function handleWeb3AuthLogin() {
    try {
      if (typeof window === "undefined") {
        alert("Web3Auth só funciona no navegador.");
        return;
      }

      // imports dinâmicos (iguais ao cadastro)
      const { Web3Auth } = await import("@web3auth/modal");
      const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
      const { CHAIN_NAMESPACES } = await import("@web3auth/base");
      const { EthereumPrivateKeyProvider } = await import("@web3auth/ethereum-provider");

      const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
      if (!clientId) {
        alert("Erro: Client ID do Web3Auth não encontrado.");
        return;
      }

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x89",
            rpcTarget: "https://polygon-rpc.com",
            displayName: "Polygon Mainnet",
            ticker: "MATIC",
            tickerName: "Polygon",
          },
        },
      });

      const web3auth = new Web3Auth({
        clientId,
        web3AuthNetwork: "sapphire_mainnet",
        privateKeyProvider,
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: "sapphire_mainnet",
          uxMode: "popup",
        },
      });

      web3auth.configureAdapter(openloginAdapter);
      await web3auth.initModal();

      const provider = await web3auth.connect();
      if (!provider) {
        alert("Não foi possível conectar ao Web3Auth.");
        return;
      }

      const userInfo = await web3auth.getUserInfo();
      localStorage.setItem("web3auth_user", JSON.stringify(userInfo));

      const email = userInfo?.email ?? `user-${Date.now()}@web3auth.io`;
      const password = crypto.randomUUID();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }

      window.location.href = "https://app-bct.vercel.app/inicio";
    } catch (err: any) {
      alert("Erro ao conectar com Web3Auth: " + (err?.message ?? String(err)));
    }
  }

  // -------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Entrar
        </h1>

        {/* LOGIN TRADICIONAL */}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 p-3 border rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Entrar
        </button>

        {/* GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg mt-4 transition"
        >
          Entrar com Google
        </button>

        {/* WEB3AUTH */}
        <button
          type="button"
          onClick={handleWeb3AuthLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg mt-3 transition"
        >
          Entrar com Web3Auth
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <a href="/cadastro" className="text-blue-600 font-medium hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
}