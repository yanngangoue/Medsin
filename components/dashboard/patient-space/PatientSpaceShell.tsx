"use client";

import type { ReactNode } from "react";
import { PatientNav } from "@/components/patient/PatientNav";

type Props = {
  prenom: string;
  email: string;
  hasGlp1Dossier: boolean;
  children: ReactNode;
};

export function PatientSpaceShell({ prenom, email, hasGlp1Dossier, children }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFCFB]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3.5 sm:px-8">
          <PatientNav hasGlp1Dossier={hasGlp1Dossier} variant="light" showLogo showSignOut />
        </div>
      </header>

      <div className="border-b border-[#C8E6D9]/50 bg-gradient-to-b from-[#F0FBF7] to-[#FAFCFB]">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1D9E75]">
            Espace patient Anne Santé
          </p>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Bonjour{prenom ? `, ${prenom}` : ""}
          </h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-600">{email}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-8 sm:pt-8">{children}</main>
    </div>
  );
}
