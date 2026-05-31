"use client";

import Link from "next/link";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { explainGlp1SimulationStatus } from "@/lib/eligibility";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";

function journeySteps(summary: Glp1DossierSummary) {
  if (summary.excluded || summary.eligibility === "NOT_ELIGIBLE") {
    return [
      { id: "form", label: "Formulaire", done: true },
      { id: "triage", label: "Tri auto.", done: true, active: false },
      { id: "review", label: "Exclusion", done: false, active: true },
      { id: "next", label: "Consultation", done: false, active: false },
    ];
  }
  return [
    { id: "form", label: "Formulaire", done: true },
    { id: "triage", label: "Tri validé", done: true },
    { id: "review", label: "Revue pro.", done: false, active: true },
    { id: "next", label: "Consultation", done: false, active: false },
  ];
}

function eligibilityCopy(summary: Glp1DossierSummary): { title: string; body: string } {
  if (summary.excluded) {
    return {
      title: "Parcours GLP-1 interrompu au tri pré-diagnostique",
      body: "Des critères d'exclusion stricts ont été identifiés. Votre dossier n'est pas transmis à un professionnel pour ce parcours.",
    };
  }
  switch (summary.eligibility) {
    case "ELIGIBLE":
      return {
        title: "Profil admissible — consultation à planifier",
        body: "Un professionnel de santé a validé votre dossier. Prochaine étape : consultation virtuelle, puis prescription si indiquée cliniquement.",
      };
    case "NOT_ELIGIBLE":
      return {
        title: "GLP-1 : non admissible",
        body: "Ce parcours ne correspond pas à votre profil. D'autres services MedSim peuvent vous accompagner.",
      };
    case "MEDICAL_REVIEW_REQUIRED":
      return {
        title: "Dossier transmis au professionnel de santé",
        body: "Votre formulaire a passé le tri automatique. Un professionnel analyse vos données sous 24 à 48 h. La décision thérapeutique finale lui appartient exclusivement.",
      };
    default:
      return {
        title: "Dossier enregistré",
        body: "Votre évaluation a été enregistrée.",
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
  const msg = eligibilityCopy(summary);
  const showAlternatives = summary.excluded || summary.eligibility === "NOT_ELIGIBLE";
  const steps = journeySteps(summary);
  const simulationReason =
    showAlternatives && summary.imc > 0
      ? explainGlp1SimulationStatus(summary.eligibility, summary.imc, "")
      : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-2 sm:pb-12">
      <nav className="mb-8" aria-label="Étapes du parcours">
        <ol className="grid grid-cols-4 gap-1 sm:gap-2">
          {steps.map((step, i) => {
            const done = "done" in step ? step.done : i < 2;
            const active = "active" in step ? step.active : i === 2;
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

      {summary.triageReasons && summary.triageReasons.length > 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left text-sm">
          <p className="font-medium text-amber-950">Critères d&apos;exclusion identifiés</p>
          <ul className="mt-2 space-y-1 text-xs text-amber-900">
            {summary.triageReasons.map((r) => (
              <li key={r.code}>• {r.labelFr}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Aucune prescription automatique. Seul un professionnel de santé peut prescrire un traitement
        GLP-1, après consultation virtuelle si requis.
      </p>
    </div>
  );
}
