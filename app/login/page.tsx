"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  // ----------- LOGIN GOOGLE --------------
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://app-bct.vercel.app/inicio" },
    });

    if (error) alert("Erro ao entrar com Google: " + error.message);
  }

  // ----------- LOGIN WEB3AUTH --------------
  async function handleWeb3AuthLogin() {
    try {
      if (typeof window === "undefined") return;

      const { Web3Auth } = await import("@web3auth/modal");
      const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
      const { CHAIN_NAMESPACES } = await import("@web3auth/base");
      const { EthereumPrivateKeyProvider } = await import(
        "@web3auth/ethereum-provider"
      );

      const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
      if (!clientId) {
        alert("Erro: Web3Auth Client ID faltando.");
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
        alert("Não foi possível conectar Web3Auth.");
        return;
      }

      const userInfo = await web3auth.getUserInfo();

      if (typeof window !== "undefined") {
        localStorage.setItem("web3auth_user", JSON.stringify(userInfo));
      }

      const email = userInfo?.email ?? `user-${Date.now()}@web3auth.io`;

      const password =
        typeof crypto !== "undefined"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

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
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar Web3Auth.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Entrar</h1>

        <button
          onClick={handleGoogleLogin}
          className="bg-[#101820] hover:bg-[#101820] text-white w-full py-3 rounded mb-4"
        >
          Entrar com Google
        </button>

        <button
          onClick={handleWeb3AuthLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded"
        >
          Entrar com Web3Auth
        </button>
      </div>
    </div>
  );
}