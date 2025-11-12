"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabaseClient";

export default function CadastroPage() {
  const router = useRouter();

  // ✅ LOGIN COM GOOGLE (mantém /dashboard em produção)
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://app-bct.vercel.app/início" },
    });
    if (error) alert("Erro ao entrar com Google: " + error.message);
  }

  // ✅ LOGIN COM WEB3AUTH (agora com redirecionamento idêntico ao Google)
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

    // Configuração de rede (Polygon Mainnet)
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
    const email = userInfo?.email ?? `user-${Date.now()}@web3auth.io`;

    // 🔐 Garante uma sessão no Supabase (com e-mail e senha fixos)
    const password = "web3auth-default-password";

    let { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Se o usuário não existir, cria e loga automaticamente
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // Espera 1 segundo e faz o login real
      await new Promise((r) => setTimeout(r, 1000));
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
    }

    // ✅ Redireciona e recarrega o contexto (Navbar, sessão, etc.)
    window.location.href = "https://app-bct.vercel.app/inicio";

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