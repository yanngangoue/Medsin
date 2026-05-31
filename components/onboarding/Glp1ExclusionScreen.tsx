"use client";

import Link from "next/link";
import type { Glp1TriageReason } from "@/lib/patient/glp1-triage";
import { GLP1_LANDING_PATH } from "@/lib/patient/glp1-flow-routes";

type Props = {
  reasons: Glp1TriageReason[];
};

export function Glp1ExclusionScreen({ reasons }: Props) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⚠
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Parcours GLP-1 non accessible à cette étape
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          D&apos;après vos réponses, notre algorithme de tri pré-diagnostique a identifié des
          critères d&apos;exclusion stricts. Votre dossier n&apos;est pas transmis à un professionnel
          de santé pour ce parcours.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Cette évaluation automatisée ne remplace pas un avis médical. D&apos;autres services MedSim
          peuvent vous accompagner.
        </p>
      </div>

      {reasons.length > 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-left">
          <h2 className="text-sm font-semibold text-slate-900">Critères identifiés</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {reasons.map((r) => (
              <li key={r.code} className="flex gap-2">
                <span className="text-amber-600" aria-hidden>
                  •
                </span>
                <span>{r.labelFr}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={GLP1_LANDING_PATH}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Retour à l&apos;accueil GLP-1
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white hover:bg-[#188763]"
        >
          Découvrir d&apos;autres services
        </Link>
      </div>
    </div>
  );
}
