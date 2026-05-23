"use client";

import Link from "next/link";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { explainGlp1SimulationStatus } from "@/lib/eligibility";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";

function journeySteps(eligibility: EligibilityStatus) {
  const thirdLabel =
    eligibility === "NOT_ELIGIBLE" ? "Résultat" : "Revue médicale";
  return [
    { id: "eval", label: "Évaluation GLP-1" },
    { id: "account", label: "Compte créé" },
    { id: "review", label: thirdLabel },
    { id: "next", label: "Prochaine étape" },
  ] as const;
}

function eligibilityCopy(status: EligibilityStatus): { title: string; body: string } {
  switch (status) {
    case "ELIGIBLE":
      return {
        title: "Profil potentiellement admissible",
        body: "Selon notre simulation, votre profil correspond aux critères GLP-1. Un professionnel de santé confirmera votre dossier sous 24 à 48 h.",
      };
    case "NOT_ELIGIBLE":
      return {
        title: "GLP-1 : non admissible en simulation",
        body: "Selon les informations fournies, ce parcours ne correspond pas aux critères de simulation. D'autres services MedSim peuvent vous accompagner.",
      };
    case "MEDICAL_REVIEW_REQUIRED":
      return {
        title: "Revue médicale requise",
        body: "Votre dossier nécessite l'examen d'un professionnel de santé. Vous serez contacté si des précisions sont nécessaires.",
      };
    case "PENDING":
    default:
      return {
        title: "Dossier en cours d'analyse",
        body: "Votre évaluation a été enregistrée. Un professionnel examine vos réponses.",
      };
  }
}

type Props = {
  prenom: string;
  summary: Glp1DossierSummary;
  syncing?: boolean;
  syncError?: string | null;
};

export function Glp1ConfirmationPanel({ prenom, summary, syncing, syncError }: Props) {
  const msg = eligibilityCopy(summary.eligibility);
  const showAlternatives = summary.eligibility === "NOT_ELIGIBLE";
  const steps = journeySteps(summary.eligibility);
  const simulationReason =
    showAlternatives && summary.imc > 0
      ? explainGlp1SimulationStatus(summary.eligibility, summary.imc, "")
      : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-2 sm:pb-12">
      <nav className="mb-8" aria-label="Étapes du parcours">
        <ol className="grid grid-cols-4 gap-1 sm:gap-2">
          {steps.map((step, i) => {
            const done = i < 2;
            const active = i === 2;
            return (
              <li key={step.id} className="flex flex-col items-center text-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold sm:h-8 sm:w-8 ${
                    done
                      ? "bg-[#1D9E75] text-white shadow-sm"
                      : active
                        ? "border-2 border-[#1D9E75] bg-white text-[#1D9E75]"
                        : "border border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`mt-1.5 line-clamp-2 text-[9px] font-medium leading-tight sm:text-[10px] ${
                    done ? "text-[#1D9E75]" : active ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="text-center">
        <EligibilityBadge status={summary.eligibility} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          {msg.title}
          {prenom ? `, ${prenom}` : ""}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{msg.body}</p>
        {simulationReason ? (
          <p className="mx-auto mt-4 max-w-md rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs leading-relaxed text-slate-600">
            {simulationReason}
          </p>
        ) : null}
        {syncing ? (
          <p className="mt-2 text-xs text-slate-500">Enregistrement de votre dossier…</p>
        ) : null}
        {syncError ? <p className="mt-2 text-xs text-red-600">{syncError}</p> : null}
      </div>

      <div className="mt-8 w-full rounded-2xl bg-slate-100 p-6 text-left text-sm text-slate-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Résumé de votre dossier
        </p>
        <ul className="space-y-3">
          <li>
            <span className="text-slate-500">Objectif :</span>{" "}
            <span className="font-medium">{summary.goal}</span>
          </li>
          <li>
            <span className="text-slate-500">Mesures :</span>{" "}
            <span className="font-medium">{summary.measures}</span>
          </li>
          <li>
            <span className="text-slate-500">Poids visé :</span>{" "}
            <span className="font-medium">{summary.idealWeight}</span>
          </li>
          <li>
            <span className="text-slate-500">Simulation :</span>{" "}
            <span className="font-medium">{summary.eligibilityLabel}</span>
          </li>
          <li>
            <span className="text-slate-500">Date :</span>{" "}
            <span className="font-medium">{summary.submittedAt}</span>
          </li>
        </ul>
      </div>

      {showAlternatives ? (
        <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
          <p className="font-medium">Poursuivre avec MedSim</p>
          <p className="mt-1 text-xs leading-relaxed">
            Explorez Nutri+ pour un accompagnement nutritionnel adapté à votre profil.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/onboarding/nutri-plus" className="font-semibold text-[#1D9E75] hover:underline">
              Nutri +
            </Link>
            <Link
              href="/onboarding/nutri-plus/produits"
              className="font-semibold text-[#1D9E75] hover:underline"
            >
              Catalogue compléments
            </Link>
          </div>
        </div>
      ) : null}

      <Link
        href={GLP1_PATIENT_DASHBOARD_PATH}
        className="mt-10 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-semibold text-white shadow-md transition hover:bg-[#178f6a]"
      >
        Accéder à mon espace patient
      </Link>

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Simulation logicielle — ne remplace pas un avis médical. Un professionnel confirme toute
        décision thérapeutique.
      </p>
    </div>
  );
}
