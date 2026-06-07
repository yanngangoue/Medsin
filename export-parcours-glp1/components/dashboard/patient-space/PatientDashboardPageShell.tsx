"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { EmergencyBanner } from "@/components/patient/EmergencyBanner";
import { PatientNav } from "@/components/patient/PatientNav";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { usePatientNotifications } from "@/lib/patient/use-patient-notifications";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "2xl" | "4xl";
  showBack?: boolean;
};

export function PatientDashboardPageShell({
  eyebrow,
  title,
  description,
  children,
  maxWidth = "2xl",
  showBack = true,
}: Props) {
  const { hasGlp1Dossier } = usePatientNotifications();
  const widthClass = maxWidth === "4xl" ? "max-w-4xl" : "max-w-2xl";

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3.5 sm:px-8">
          <PatientNav hasGlp1Dossier={hasGlp1Dossier} variant="light" showLogo showSignOut />
        </div>
      </header>

      <main className={`mx-auto ${widthClass} space-y-8 px-4 py-8 sm:px-6`}>
        {showBack ? (
          <Link
            href={GLP1_PATIENT_DASHBOARD_PATH}
            className="inline-flex text-sm font-semibold text-[#1D4D3A] hover:underline"
          >
            ← Mon espace
          </Link>
        ) : null}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1D4D3A]">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">{description}</p>
          ) : null}
        </div>

        <EmergencyBanner />
        {children}
      </main>
    </div>
  );
}
