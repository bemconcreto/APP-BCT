"use client";

import { useState } from "react";

export default function CartaoCheckout() {
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mensagem, setMensagem] = useState("");

  const tokens = 2.104855;
  const amountBRL = 5;

  const pagar = async () => {
    setMensagem("");
    setLoading(true);

    try {
      const resp = await fetch("/api/asaas/cartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 🔥 NECESSÁRIO PARA AUTENTICAÇÃO
          Authorization: `Bearer ${localStorage.getItem("sb-access-token")}`,
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
        setMensagem(`Erro ao gerar pagamento com cartão: ${data.error}`);
      } else {
        setMensagem("Pagamento gerado com sucesso! Aguarde a confirmação.");
      }
    } catch (err) {
      setMensagem("Erro interno ao processar o pagamento.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Pagamento com Cartão</h1>

      {mensagem && (
        <div
          style={{
            background: "#f8d7da",
            padding: 12,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {mensagem}
        </div>
      )}

      <input
        placeholder="Nome no cartão"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <br />

      <input
        placeholder="Número do cartão"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <br />

      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Mês"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
        <input
          placeholder="Ano"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        />
      </div>
      <br />

      <input
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
      />
      <br />

      <input
        placeholder="CPF/CNPJ"
        value={cpfCnpj}
        onChange={(e) => setCpfCnpj(e.target.value)}
      />
      <br />

      <input
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br />

      <button
        onClick={pagar}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          background: loading ? "#999" : "#0066ff",
          color: "#fff",
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