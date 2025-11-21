"use client";

import { Suspense } from "react";
import PixContent from "./pix-content";

export default function Page() {
  return (
    <Suspense>
      <PixContent />
    </Suspense>
  );
}