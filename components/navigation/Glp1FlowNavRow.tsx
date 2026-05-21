"use client";

import type { Glp1FlowNavAction } from "@/components/onboarding/Glp1FlowHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { ForwardButton } from "@/components/navigation/ForwardButton";

type Props = {
  back: Glp1FlowNavAction;
  forward?: Glp1FlowNavAction;
  hint?: string;
};

export function Glp1FlowNavRow({ back, forward, hint }: Props) {
  return (
    <div className="w-full rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {back.onClick ? (
          <button
            type="button"
            onClick={back.onClick}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D9E75] hover:text-[var(--teal-900)]"
          >
            <span aria-hidden>‹</span>
            {back.label ?? "Retour"}
          </button>
        ) : (
          <BackButton
            href={back.href ?? "/"}
            className="text-sm font-semibold text-[#1D9E75] hover:text-[var(--teal-900)]"
          >
            {back.label ?? "Retour"}
          </BackButton>
        )}

        {forward ? (
          forward.onClick ? (
            <ForwardButton
              onClick={forward.onClick}
              disabled={forward.disabled}
              className="text-sm font-semibold text-[#1D9E75] hover:text-[var(--teal-900)] disabled:opacity-45"
            >
              {forward.label ?? "Suivant"}
            </ForwardButton>
          ) : (
            <ForwardButton
              href={forward.href}
              disabled={forward.disabled}
              className="text-sm font-semibold text-[#1D9E75] hover:text-[var(--teal-900)] disabled:opacity-45"
            >
              {forward.label ?? "Suivant"}
            </ForwardButton>
          )
        ) : (
          <span className="w-16" aria-hidden />
        )}
      </div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}
