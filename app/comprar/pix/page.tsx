"use client";

import { Suspense } from "react";
import PixContent from "./pix-content";

export default function PixPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PixContent />
    </Suspense>
  );
}