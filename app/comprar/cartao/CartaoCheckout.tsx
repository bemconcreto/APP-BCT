"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function CartaoCheckout() {
  const params = useSearchParams();
  const router = useRouter();

  const amountBRL = Number(params.get("amount") || "0");
  const tokens = Number(params.get("tokens") || "0");

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function pagar() {
    setErro("");
    setLoading(true);

    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;

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
          Authorization: `Bearer ${token}`,  // ← AGORA O BACKEND RECEBE O USUÁRIO
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
        setErro(data.error || "Erro ao processar pagamento.");
        setLoading(false);
        return;
      }

      router.push("/comprar/sucesso");
    } catch (err) {
      setErro("Erro interno ao tentar pagar.");
    }

    setLoading(false);
  }

  return (
    <div className="container">

      <h1>Pagamento com Cartão</h1>

      {erro && (
        <div style={{ background: "#f8d7da", padding: 12, borderRadius: 6 }}>
          Erro ao gerar pagamento com cartão: {erro}
        </div>
      )}

      <input placeholder="Nome no Cartão" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Número do Cartão" value={numero} onChange={(e) => setNumero(e.target.value)} />

      <div style={{ display: "flex", gap: 10 }}>
        <input placeholder="Mês" value={mes} onChange={(e) => setMes(e.target.value)} />
        <input placeholder="Ano" value={ano} onChange={(e) => setAno(e.target.value)} />
      </div>

      <input placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} />
      <input placeholder="CPF/CNPJ" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />

      <button onClick={pagar} disabled={loading} style={{ marginTop: 20 }}>
        {loading ? "Processando..." : "Pagar"}
      </button>
    </div>
  );
}