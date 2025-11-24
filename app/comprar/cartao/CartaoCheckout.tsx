"use client";
import { useState } from "react";

export default function CartaoCheckout({ searchParams }: any) {
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const amountBRL = Number(searchParams.amountBRL);
  const tokens = Number(searchParams.tokens);
  const cpfCnpj = searchParams.cpfCnpj;
  const email = searchParams.email;
  const phone = searchParams.phone;

  async function pagar() {
    setMensagem("");
    setLoading(true);

    try {
      const token = localStorage.getItem("sb-access-token");

      const resp = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
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

      const data = await resp.json();

      if (!resp.ok) {
        setMensagem(data.error || "Erro ao gerar pagamento.");
      } else {
        setMensagem("Pagamento gerado com sucesso!");
      }
    } catch (e) {
      setMensagem("Erro inesperado.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h1>Pagamento com Cartão</h1>

      {mensagem && (
        <div
          style={{
            background: "#f8d7da",
            padding: 12,
            borderRadius: 6,
            marginBottom: 15,
            color: "#721c24",
          }}
        >
          {mensagem}
        </div>
      )}

      <input
        placeholder="Nome no cartão"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Número do cartão"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Mês"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />

        <input
          placeholder="Ano"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>

      <input
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={pagar}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 15,
          background: "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontSize: 18,
        }}
      >
        {loading ? "Processando..." : "Pagar"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 16,
};