"use client";

import CartaoCheckout from "./CartaoCheckout";

export default function Page({ searchParams }: any) {
  // tudo vem da URL
  const amountBRL = Number(searchParams.amountBRL || 0);
  const tokens = Number(searchParams.tokens || 0);
  const cpfCnpj = searchParams.cpfCnpj || "";
  const email = searchParams.email || "";
  const phone = searchParams.phone || "";

  return (
    <CartaoCheckout
      amountBRL={amountBRL}
      tokens={tokens}
      cpfCnpj={cpfCnpj}
      email={email}
      phone={phone}
    />
  );
}