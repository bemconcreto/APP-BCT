"use client";

import { supabase } from "../../../src/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartaoCheckout({ amountBRL, tokens, cpfCnpj, email, phone }: any) {
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function pagar() {
    setErro("");
    setLoading(true);

    // 🔥 PEGAR TOKEN DO SUPABASE — IGUAL O PIX!
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setErro("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ENVIA O TOKEN DE AUTH
        },
        body: JSON.stringify({
          nome,
          numero,
          mes,
          ano,
          cvv,
          amountBRL,
          tokens,
          cpfCnpj,
          email,
          phone,
        }),
      });

      const result = await resp.json();

      if (!result.success) {
  setErro(result.error || "Erro no pagamento.");
} else {
  // 🔥 Redireciona para tela de sucesso
  window.location.href = "/tela-sucesso";
}
    } catch (e) {
      console.error("Erro:", e);
      setErro("Erro interno ao processar pagamento.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pagamento com Cartão</h1>

      {erro && (
        <div style={{ background: "#ffdddd", padding: 12, marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <input
          placeholder="Nome impresso no cartão"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Número do cartão"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Mês (MM)"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
          <input
            placeholder="Ano (AA ou AAAA)"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          />
        </div>

        <input
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />

        <button
          onClick={pagar}
          disabled={loading}
          style={{
            background: "#0066ff",
            color: "white",
            padding: 12,
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          {loading ? "Processando..." : "Pagar"}
        </button>
      </div>
    </div>
  );
}