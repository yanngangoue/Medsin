"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Glp1FlowHeader,
  type Glp1FlowNavAction,
} from "@/components/onboarding/Glp1FlowHeader";
import { Glp1PatientChrome } from "@/components/onboarding/Glp1PatientChrome";
import { GLP1_WIZARD_STEP_COUNT } from "@/lib/patient/glp1-eligibility-questions";
import { isStaggerVisible } from "./useStaggerReveal";

type WizardHeaderProps = {
  back: Glp1FlowNavAction;
  forward: Glp1FlowNavAction;
};

export function Glp1WizardHeader({ back, forward }: WizardHeaderProps) {
  return (
    <>
      <Glp1FlowHeader back={back} forward={forward} />
      <Glp1PatientChrome />
    </>
  );
}

export function Glp1ProgressBar({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 sm:px-6">
      <p className="mb-2 text-center text-xs font-medium text-slate-500">
        Étape {stepIndex + 1} sur {GLP1_WIZARD_STEP_COUNT}
      </p>
      <div className="flex gap-1.5">
      {Array.from({ length: GLP1_WIZARD_STEP_COUNT }, (_, i) => (
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

export function Glp1Reveal({
  index,
  visibleCount,
  children,
  className = "",
}: {
  index: number;
  visibleCount: number;
  children: ReactNode;
  className?: string;
}) {
  if (!isStaggerVisible(index, visibleCount)) return null;
  return (
    <div className={`glp1-reveal ${className}`} style={{ animationDelay: `${index * 30}ms` }}>
      {children}
    </div>
  );
}

export function Glp1QuestionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-bold text-slate-900 sm:text-lg">{children}</h2>;
}

export function Glp1CardButton({
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
          ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
          : "border-slate-200/90 hover:border-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Glp1YesNoCards({
  value,
  onChange,
  revealIndex,
  visibleCount,
}: {
  value?: "oui" | "non";
  onChange: (v: "oui" | "non") => void;
  revealIndex: number;
  visibleCount: number;
}) {
  return (
    <Glp1Reveal index={revealIndex} visibleCount={visibleCount} className="mt-4 grid grid-cols-2 gap-3">
      {(
        [
          { id: "non" as const, label: "Non", icon: "✓", bg: "bg-emerald-50", color: "text-emerald-600" },
          { id: "oui" as const, label: "Oui", icon: "✕", bg: "bg-red-50", color: "text-red-500" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex flex-col items-center gap-2 rounded-xl border bg-white px-4 py-6 shadow-sm transition ${
            value === opt.id
              ? "border-[#5B9FD4] ring-2 ring-[#5B9FD4]/25"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${opt.bg} ${opt.color}`}
          >
            {opt.icon}
          </span>
          <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
        </button>
      ))}
    </Glp1Reveal>
  );
}

export function Glp1NextButton({
  onClick,
  disabled,
  label = "Suivant →",
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
      className="mt-6 w-full rounded-xl bg-[#1D9E75] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#178f6a] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {label}
    </button>
  );
}

export function Glp1IntroHero() {
  return (
    <div className="relative mx-auto mt-6 max-w-lg overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] w-full bg-[#2A9D8F]">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=85"
          alt="Femme active souriante"
          fill
          className="object-cover object-top"
          sizes="(max-width: 512px) 100vw, 512px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A9D8F]/80 via-transparent to-transparent" />
        <p className="absolute bottom-4 left-4 text-3xl font-bold tracking-tight text-white/90">MedSim</p>
      </div>
    </div>
  );
}
