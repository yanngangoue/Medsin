"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Glp1FlowHeader } from "@/components/onboarding/Glp1FlowHeader";
import { Glp1PatientChrome } from "@/components/onboarding/Glp1PatientChrome";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import { glp1QuestionnaireResumeUrl } from "@/lib/patient/glp1-wizard-progress";
import { MedsimLogo } from "@/components/MedsimLogo";

const STEPS_DEFAULT = [
  { path: "/auth/inscription", label: "Inscription" },
  { path: "/onboarding/questionnaire", label: "Questionnaire" },
  { path: "/onboarding/confirmation", label: "Confirmation" },
] as const;

const STEPS_GLP1 = [
  { path: "/auth/inscription", label: "Compte" },
  { path: "/onboarding/confirmation", label: "Confirmation" },
] as const;

function isGlp1Onboarding(service: string | null, pathname: string) {
  return service === "gestion-poids" || pathname.includes("/gestion-poids/");
}

function stepIndex(pathname: string, glp1: boolean): number {
  if (pathname.startsWith("/onboarding/confirmation")) return glp1 ? 1 : 2;
  if (!glp1 && pathname.startsWith("/onboarding/questionnaire")) return 1;
  return 0;
}

const LANDING_ONLY_PATHS = ["/onboarding/repas-sante", "/onboarding/gestion-poids"] as const;

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const glp1Flow = isGlp1Onboarding(service, pathname);
  const steps = glp1Flow ? STEPS_GLP1 : STEPS_DEFAULT;
  const isLandingOnly = LANDING_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isLandingOnly) {
    return <>{children}</>;
  }

  const active = stepIndex(pathname, glp1Flow);
  const softMintBg = pathname.startsWith("/auth/inscription");
  const isGlp1Confirmation =
    glp1Flow && pathname.startsWith("/onboarding/confirmation");

  if (isGlp1Confirmation) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Glp1FlowHeader
          back={{ href: glp1QuestionnaireResumeUrl(), label: "Retour" }}
          forward={{ href: GLP1_PATIENT_DASHBOARD_PATH, label: "Mon espace" }}
          subtitle="Retour : modifier le questionnaire · Mon espace : dossier et suivi"
        />
        <Glp1PatientChrome hasGlp1Dossier={true} />
        <main className="flex min-h-[50vh] flex-1 flex-col px-4 py-6 sm:px-6">{children}</main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen flex-col ${softMintBg ? "bg-[#F0FBF7]" : "bg-white"}`}>
      <header className="border-b border-slate-100 px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
          <Link href={PUBLIC_CATALOG_HOME} className="inline-flex" aria-label="Accueil — catalogue">
            <MedsimLogo />
          </Link>
          <nav
            className="flex w-full max-w-md items-center justify-between gap-2"
            aria-label="Progression"
          >
            {steps.map((step, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <div key={step.path} className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#1D9E75] text-white"
                        : isPast
                          ? "bg-[#1D9E75]/20 text-[#1D9E75]"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`hidden text-center text-xs font-medium sm:block ${
                      isActive ? "text-[#1D9E75]" : isPast ? "text-[#1D9E75]/80" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </nav>
          <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1D9E75] transition-all duration-300 ease-out"
              style={{ width: `${((active + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </header>
      <main className="flex min-h-[50vh] flex-1 flex-col px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
