"use client";

import { Suspense } from "react";
import { ConnexionFormPanel } from "@/components/auth/ConnexionFormPanel";

export default function AuthConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
          Chargement…
        </div>
      }
    >
      <ConnexionFormPanel />
    </Suspense>
  );
}
