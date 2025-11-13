"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------------------------
  // LOGIN COM EMAIL + SENHA
  // ------------------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
      setLoading(false);
      return;
    }

    router.push("/inicio");
  }

  // ------------------------------------
  // LOGIN COM GOOGLE
  // ------------------------------------
  async function loginGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/inicio`
      }
    });

    if (error) alert("Erro ao entrar com Google: " + error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Entrar na sua conta
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
        <div className="my-6 text-center text-gray-500 text-sm">ou</div>

        {/* LOGIN GOOGLE */}
        <button
          type="button"
          onClick={loginGoogle}
          className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            className="w-5 h-5"
          />
          Entrar com Google
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