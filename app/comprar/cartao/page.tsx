"use client";

import { Suspense } from "react";
import CartaoCheckout from "./CartaoCheckout";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <CartaoCheckout />
    </Suspense>
  );
}