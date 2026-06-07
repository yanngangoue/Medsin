"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { dsBtnPrimary, dsBtnSecondary, dsCard } from "@/lib/design-system";

const ELIGIBILITY_RESULT_KEY = "medsim.eligibility.result";

type EligibilityDisplayStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "BORDERLINE";

function parseStatus(value: string | null): EligibilityDisplayStatus | null {
  if (value === "ELIGIBLE" || value === "NOT_ELIGIBLE" || value === "BORDERLINE") {
    return value;
  }
  return null;
}

function EligibiliteResultatContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<EligibilityDisplayStatus | null>(null);

  useEffect(() => {
    const fromUrl = parseStatus(searchParams.get("status"));
    if (fromUrl) {
      setStatus(fromUrl);
      sessionStorage.setItem(ELIGIBILITY_RESULT_KEY, fromUrl);
      return;
    }
    const fromStorage = parseStatus(sessionStorage.getItem(ELIGIBILITY_RESULT_KEY));
    setStatus(fromStorage);
  }, [searchParams]);

  if (!status) {
    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <h1 className="text-xl font-bold text-[#1A1A2E]">Résultat non disponible</h1>
        <p className="mt-3 text-sm text-[#6B7280]">
          Complétez d&apos;abord le questionnaire d&apos;éligibilité pour voir votre résultat.
        </p>
        <Link href="/eligibilite" className={`mt-6 ${dsBtnPrimary}`}>
          Faire le test d&apos;éligibilité
        </Link>
      </div>
    );
  }

  if (status === "ELIGIBLE") {
    return (
      <div className={`${dsCard} mx-auto max-w-lg border-emerald-100 bg-[#F0FDF4] text-center`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#10B981]">Admissible</p>
        <h1 className="mt-3 text-3xl font-bold text-[#1A1A2E]">Bonne nouvelle !</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          Vos réponses indiquent qu&apos;un parcours GLP-1 pourrait vous convenir. Poursuivez avec
          le questionnaire médical complet — environ 5 minutes, sans engagement.
        </p>
        <Link href="/questionnaire" className={`mt-8 inline-flex h-14 items-center ${dsBtnPrimary}`}>
          Commencer mon évaluation →
        </Link>
      </div>
    );
  }

  if (status === "NOT_ELIGIBLE") {
    return (
      <div className={`${dsCard} mx-auto max-w-lg border-orange-100 bg-[#FFF7ED] text-center`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#EA580C]">
          Non admissible pour l&apos;instant
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#1A1A2E]">
          Votre santé demeure notre priorité
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          D&apos;après vos réponses, le GLP-1 n&apos;est pas recommandé en ce moment sans un avis
          médical approfondi. Ce n&apos;est pas un jugement — chaque parcours est unique.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          Consultez votre médecin de famille ou composez le 811 pour un accompagnement adapté à
          votre situation au Québec.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="https://www.quebec.ca/sante/trouver-une-ressource/info-sante-811"
            target="_blank"
            rel="noopener noreferrer"
            className={dsBtnPrimary}
          >
            Info-Santé 811
          </Link>
          <Link href="/" className={dsBtnSecondary}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dsCard} mx-auto max-w-lg border-sky-100 bg-[#EFF6FF] text-center`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">À évaluer</p>
      <h1 className="mt-3 text-3xl font-bold text-[#1A1A2E]">Nous allons évaluer votre dossier</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        Certaines de vos réponses méritent une revue par un professionnel MedSim. Vous pouvez
        quand même poursuivre le questionnaire — notre équipe confirmera votre admissibilité.
      </p>
      <Link
        href="/questionnaire?borderline=1"
        className={`mt-8 inline-flex h-14 items-center ${dsBtnPrimary}`}
      >
        Poursuivre mon évaluation →
      </Link>
    </div>
  );
}

export default function EligibiliteResultatPage() {
  return (
    <div>
      <p className="text-center text-xs font-bold uppercase tracking-wider text-[#1D4D3A]">
        Résultat · Éligibilité
      </p>
      <Suspense
        fallback={
          <div className={`${dsCard} mx-auto max-w-lg animate-pulse text-center text-sm text-[#6B7280]`}>
            Chargement de votre résultat…
          </div>
        }
      >
        <EligibiliteResultatContent />
      </Suspense>
    </div>
  );
}
