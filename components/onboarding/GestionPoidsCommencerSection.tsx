"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { GLP1_BENEFITS } from "@/lib/patient/glp1-content";
import {
  GLP1_WEIGHT_GOAL_OPTIONS,
  GLP1_WEIGHT_GOAL_STORAGE_KEY,
  type Glp1WeightGoalId,
} from "@/lib/patient/glp1-weight-goal";

const INSCRIPTION_PATH = "/onboarding/inscription?service=gestion-poids";
const CALLBACK = "/onboarding/gestion-poids#commencer";

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5 8l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GestionPoidsCommencerSection() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [selected, setSelected] = useState<Glp1WeightGoalId | null>(null);

  function handleContinue() {
    if (!selected) return;
    try {
      sessionStorage.setItem(GLP1_WEIGHT_GOAL_STORAGE_KEY, selected);
    } catch {
      /* ignore */
    }
    router.push(INSCRIPTION_PATH);
  }

  return (
    <section
      id="commencer"
      className="border-t border-[#E8E0D8]/80 bg-[#F5F0EB] px-4 py-10 sm:px-8 sm:py-14"
      aria-labelledby="glp-commencer-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1D9E75]">
            Étape 1 · Environ 2 minutes
          </p>
          <h2
            id="glp-commencer-title"
            className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            Commencer mon parcours GLP-1
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Indiquez votre objectif de perte de poids, puis complétez votre dossier en ligne. Un
            professionnel examinera vos réponses avant toute prescription.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-start lg:gap-10">
          <div className="order-2 lg:order-1">
            <ul className="space-y-3">
              {GLP1_BENEFITS.map((b) => (
                <li
                  key={b.title}
                  className="flex gap-3 rounded-xl border border-[#C8E6D9]/50 bg-white/80 px-4 py-3.5 shadow-sm"
                >
                  <CheckIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 hidden lg:block">
              {status === "loading" ? (
                <p className="text-sm text-slate-500">Chargement…</p>
              ) : isAuthenticated ? (
                <Link
                  href="/onboarding/questionnaire"
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#1D9E75] bg-white px-6 py-3 text-sm font-semibold text-[#1D9E75] transition hover:bg-[#F0FBF7]"
                >
                  Continuer mon questionnaire
                </Link>
              ) : (
                <p className="text-sm text-slate-600">
                  Déjà inscrit ?{" "}
                  <Link
                    href={`/connexion?callbackUrl=${encodeURIComponent(CALLBACK)}`}
                    className="font-semibold text-[#1D9E75] underline-offset-2 hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {status === "loading" ? (
              <div className="mx-auto max-w-[400px] rounded-2xl bg-[#F7F4F0] px-5 py-10 text-center shadow-sm ring-1 ring-black/[0.04]">
                <p className="text-sm text-slate-500">Chargement…</p>
              </div>
            ) : isAuthenticated ? (
              <div className="mx-auto max-w-[400px] rounded-2xl bg-[#F7F4F0] px-5 py-7 text-center shadow-sm ring-1 ring-black/[0.04] sm:px-6">
                <p className="text-sm font-semibold text-slate-900">Votre compte est actif</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  Poursuivez le questionnaire médical pour faire évaluer votre dossier.
                </p>
                <Link
                  href="/onboarding/questionnaire"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--teal-900)] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[var(--teal)]"
                >
                  Continuer le questionnaire
                </Link>
              </div>
            ) : (
              <div className="mx-auto max-w-[400px] rounded-2xl bg-[#F7F4F0] px-5 py-6 shadow-sm ring-1 ring-black/[0.04] sm:px-6 sm:py-7">
                <h3 className="text-center text-base font-bold leading-snug text-[#1A1A1A] sm:text-[17px]">
                  Quel est votre objectif de perte de poids ?
                </h3>

                <ul
                  className="mt-5 space-y-2"
                  role="listbox"
                  aria-label="Objectif de perte de poids"
                >
                  {GLP1_WEIGHT_GOAL_OPTIONS.map((option) => {
                    const isSelected = selected === option.id;
                    return (
                      <li key={option.id} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          onClick={() => setSelected(option.id)}
                          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-left text-[13px] font-medium leading-snug text-[#1A1A1A] transition sm:text-sm ${
                            isSelected
                              ? "border-[var(--teal-900)] ring-1 ring-[var(--teal-900)]/20 shadow-sm"
                              : "border-slate-200/90 hover:border-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selected}
                  className="mt-5 w-full rounded-full bg-[var(--teal-900)] py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[var(--teal)] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-xs"
                >
                  Continuer vers l&apos;inscription
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
                  Déjà inscrit ?{" "}
                  <Link
                    href={`/connexion?callbackUrl=${encodeURIComponent(CALLBACK)}`}
                    className="font-medium text-[#1D9E75] hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400 lg:mt-10">
          Les informations fournies ne constituent pas un avis médical. Toute prescription est soumise
          à l&apos;évaluation d&apos;un professionnel de santé autorisé au Québec.
        </p>
      </div>
    </section>
  );
}
