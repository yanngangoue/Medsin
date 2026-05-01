"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MedsimLogo } from "@/components/MedsimLogo";

const STEPS = [
  { path: "/onboarding/inscription", label: "Inscription" },
  { path: "/onboarding/questionnaire", label: "Questionnaire" },
  { path: "/onboarding/confirmation", label: "Confirmation" },
] as const;

function stepIndex(pathname: string): number {
  if (pathname.startsWith("/onboarding/confirmation")) return 2;
  if (pathname.startsWith("/onboarding/questionnaire")) return 1;
  return 0;
}

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = stepIndex(pathname);
  const softMintBg = pathname.startsWith("/onboarding/inscription");

  return (
    <div className={`flex min-h-screen flex-col ${softMintBg ? "bg-[#F0FBF7]" : "bg-white"}`}>
      <header className="border-b border-slate-100 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <Link href="/" className="inline-flex">
            <MedsimLogo />
          </Link>
          <nav className="flex w-full max-w-md items-center justify-between gap-2" aria-label="Progression">
            {STEPS.map((step, i) => {
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
              style={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>
      <main className="flex min-h-[50vh] flex-1 flex-col px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
