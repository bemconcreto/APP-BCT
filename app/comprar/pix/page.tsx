"use client";

import { Suspense } from "react";
import PixPagamentoInner from "./pix-inner";

export const dynamic = "force-dynamic";

export default function PixWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Carregando...
      </div>
    }>
      <PixPagamentoInner />
    </Suspense>
  );
}