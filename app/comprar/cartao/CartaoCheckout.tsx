"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CartaoCheckout() {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const tokens = Number(searchParams.get("tokens") || 0);
  const amountBRL = Number(searchParams.get("amountBRL") || 0);
  const cpfCnpj = searchParams.get("cpfCnpj") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCVV] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function pagar() {
    setMensagem("");
    setLoading(true);

    try {
      // 🔐 Recupera sessão para mandar token no header
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setMensagem("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const resp = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ← ESSENCIAL
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

      const dataResp = await resp.json();

      if (!resp.ok) {
        setMensagem(`Erro ao gerar pagamento com cartão: ${dataResp.error}`);
        setLoading(false);
        return;
      }

      setMensagem("Pagamento realizado com sucesso!");
    } catch (e) {
      setMensagem("Erro interno ao processar pagamento.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pagamento com Cartão</h1>

      {mensagem && (
        <div
          style={{
            background: "#fdd",
            padding: 12,
            marginBottom: 15,
            borderRadius: 6,
          }}
        >
          {mensagem}
        </div>
      )}

      <input
        placeholder="Nome no cartão"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="input"
      />

      <input
        placeholder="Número do cartão"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        className="input"
      />

      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Mês"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="input"
        />
        <input
          placeholder="Ano"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="input"
        />
      </div>

      <input
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCVV(e.target.value)}
        className="input"
      />

      <button
        onClick={pagar}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 14,
          background: "#0057ff",
          color: "white",
          borderRadius: 6,
          border: "none",
          fontSize: 18,
          fontWeight: "bold",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Processando..." : "Pagar"}
      </button>
    </div>
  );
}