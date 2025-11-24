"use client";

import { useState } from "react";

export default function CartaoCheckout({ amountBRL, tokens }: any) {
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function pagar() {
    setMensagem("");
    setLoading(true);

    try {
      const token = localStorage.getItem("supabase.auth.token")
        ? JSON.parse(localStorage.getItem("supabase.auth.token")!).currentSession
            .access_token
        : null;

      if (!token) {
        setMensagem("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const resp = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          numero,
          mes,
          ano,
          cvv,
          cpfCnpj,
          email,
          phone,
          amountBRL,
          tokens,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setMensagem(data.error || "Erro ao processar pagamento.");
        setLoading(false);
        return;
      }

      setMensagem("Pagamento realizado com sucesso!");
    } catch (err) {
      console.error(err);
      setMensagem("Erro interno.");
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
            border: "1px solid #f99",
            padding: 10,
            marginBottom: 20,
          }}
        >
          {mensagem}
        </div>
      )}

      <input
        placeholder="Nome do titular"
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
          placeholder="MM"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="input"
        />
        <input
          placeholder="AA"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="input"
        />
      </div>

      <input
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        className="input"
      />

      <input
        placeholder="CPF/CNPJ"
        value={cpfCnpj}
        onChange={(e) => setCpfCnpj(e.target.value)}
        className="input"
      />

      <input
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />

      <input
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input"
      />

      <button
        onClick={pagar}
        disabled={loading}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          background: loading ? "#999" : "#0066ff",
          color: "#fff",
          borderRadius: 6,
          fontSize: 18,
        }}
      >
        {loading ? "Processando..." : "Pagar"}
      </button>
    </div>
  );
}