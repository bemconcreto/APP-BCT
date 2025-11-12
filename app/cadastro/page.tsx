"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function CadastroPage() {
  const router = useRouter();

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/dashboard" },
    });
    if (error) alert("Erro ao entrar com Google: " + error.message);
  }

  async function handleWeb3AuthLogin() {
    try {
      if (typeof window === "undefined") {
        alert("Web3Auth só funciona no navegador.");
        return;
      }

      const { Web3Auth } = await import("@web3auth/modal");
      const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
      const { CHAIN_NAMESPACES } = await import("@web3auth/base");
      const { EthereumPrivateKeyProvider } = await import("@web3auth/ethereum-provider");

      const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
      if (!clientId) {
        alert("Erro: Client ID do Web3Auth não encontrado.");
        return;
      }

      // ✅ Corrigido com o privateKeyProvider
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x89", // Polygon Mainnet
            rpcTarget: "https://polygon-rpc.com",
            displayName: "Polygon Mainnet",
            ticker: "MATIC",
            tickerName: "Polygon",
          },
        },
      });

      const web3auth = new Web3Auth({
        clientId,
        web3AuthNetwork: "mainnet",
        privateKeyProvider,
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          network: "mainnet",
          uxMode: "popup",
          whiteLabel: {
            name: "Bem Concreto Token",
            logoLight: "https://bemconcreto.com/favicon.ico",
            logoDark: "https://bemconcreto.com/favicon.ico",
            defaultLanguage: "pt",
            mode: "dark",
          },
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
      console.log("✅ Web3Auth conectado:", userInfo);

      const email = userInfo?.email ?? `user-${Date.now()}@web3auth.io`;

      const { error } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID(),
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Erro no Web3Auth:", err);
      alert("Erro ao conectar com Web3Auth: " + (err?.message ?? String(err)));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Criar Conta</h1>

        <button
          onClick={handleGoogleLogin}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded mb-4"
        >
          Entrar com Google
        </button>

        <button
          onClick={handleWeb3AuthLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded"
        >
          Entrar com Web3Auth
        </button>
      </div>
    </div>
  );
}