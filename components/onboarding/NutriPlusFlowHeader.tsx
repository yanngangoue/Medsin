"use client";

import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import { BackButton } from "@/components/navigation/BackButton";
import { ForwardButton } from "@/components/navigation/ForwardButton";

export type NutriPlusFlowNavAction = {
  href?: string;
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
};

type Props = {
  back: NutriPlusFlowNavAction;
  forward?: NutriPlusFlowNavAction;
  subtitle?: string;
};

export function NutriPlusFlowHeader({ back, forward, subtitle }: Props) {
  const backLabel = back.label ?? "Retour";
  const forwardLabel = forward?.label ?? "Suivant";

  return (
    <header className="border-b border-[#E8E0D8]/90 bg-[#F5F0EB] px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="justify-self-start">
            {back.onClick ? (
              <button
                type="button"
                onClick={back.onClick}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="text-[#1D9E75]" aria-hidden>
                  ‹
                </span>
                {backLabel}
              </button>
            ) : (
              <BackButton href={back.href ?? "/"}>{backLabel}</BackButton>
            )}
          </div>

          <div className="flex flex-col items-center justify-self-center gap-0.5">
            <Link
              href={PUBLIC_CATALOG_HOME}
              className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
              aria-label="MedSim — accueil"
            >
              <MedsimLogo className="text-lg sm:text-xl" />
            </Link>
            <PartNavAccueilLink className="text-[10px] font-semibold uppercase tracking-wide text-[#1D9E75] hover:text-[var(--teal-900)]" />
          </div>

          <div className="justify-self-end">
            {forward ? (
              forward.onClick ? (
                <button
                  type="button"
                  onClick={forward.onClick}
                  disabled={forward.disabled}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                >
                  {forwardLabel}
                  <span className="text-[#1D9E75]" aria-hidden>
                    ›
                  </span>
                </button>
              ) : (
                <ForwardButton href={forward.href ?? "#"} disabled={forward.disabled}>
                  {forwardLabel}
                </ForwardButton>
              )
            ) : (
              <span className="w-[72px]" aria-hidden />
            )}
          </div>
        </div>
        {subtitle ? (
          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
