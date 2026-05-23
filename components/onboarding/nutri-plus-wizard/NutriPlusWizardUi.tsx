"use client";

import type { ReactNode } from "react";
import {
  NutriPlusFlowHeader,
  type NutriPlusFlowNavAction,
} from "@/components/onboarding/NutriPlusFlowHeader";

type WizardHeaderProps = {
  back: NutriPlusFlowNavAction;
  forward: NutriPlusFlowNavAction;
  subtitle?: string;
};

export function NutriPlusWizardHeader({ back, forward, subtitle }: WizardHeaderProps) {
  return <NutriPlusFlowHeader back={back} forward={forward} subtitle={subtitle} />;
}

export function NutriPlusProgressBar({
  stepIndex,
  totalSteps,
  labelPrefix = "Étape",
}: {
  stepIndex: number;
  totalSteps: number;
  labelPrefix?: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 sm:px-6">
      <p className="mb-2 text-center text-xs font-medium text-slate-500">
        {labelPrefix} {stepIndex + 1} sur {totalSteps}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= stepIndex ? "bg-[var(--teal-900)]" : "bg-slate-200"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

export function NutriPlusQuestionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-bold text-slate-900 sm:text-lg">{children}</h2>;
}

export function NutriPlusCardButton({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition ${
        selected
          ? "border-[#1D9E75] ring-2 ring-[#1D9E75]/25"
          : "border-slate-200/90 hover:border-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function NutriPlusNextButton({
  onClick,
  disabled,
  label = "Suivant",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-full bg-[var(--teal-900)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--teal)] disabled:opacity-40"
    >
      {label}
    </button>
  );
}
