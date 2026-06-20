"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ELIGIBILITY_RESULT_KEY } from "@/lib/onboarding/eligibility-session";

const INSCRIPTION_QUESTIONNAIRE =
  "/auth/inscription?service=gestion-poids&callbackUrl=%2Fquestionnaire";

type EligibilityDisplayStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "BORDERLINE";

function parseStatus(value: string | null): EligibilityDisplayStatus | null {
  if (value === "ELIGIBLE" || value === "NOT_ELIGIBLE" || value === "BORDERLINE") return value;
  return null;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="mx-auto h-16 w-16">
      <circle cx="24" cy="24" r="22" stroke="#3EBD93" strokeWidth="2.5" className="medsim-check-circle" />
      <path d="M14 24l7 7 13-14" stroke="#3EBD93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="medsim-check-mark" />
    </svg>
  );
}

function ResultCard({ children, border = "border-slate-100" }: { children: React.ReactNode; border?: string }) {
  return (
    <div className={`q-enter-forward mx-auto max-w-lg rounded-3xl border ${border} bg-white p-8 text-center shadow-xl`}>
      {children}
    </div>
  );
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
      <ResultCard>
        <p className="font-display text-xl font-bold text-slate-900">Résultat non disponible</p>
        <p className="mt-3 text-sm text-slate-500">
          Complétez d&apos;abord le questionnaire d&apos;éligibilité pour voir votre résultat.
        </p>
        <Link href="/eligibilite" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-6 text-sm font-bold text-white shadow-md transition hover:shadow-lg">
          Faire le test
        </Link>
      </ResultCard>
    );
  }

  if (status === "ELIGIBLE") {
    return (
      <ResultCard border="border-[#3EBD93]/20">
        <CheckIcon />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#3EBD93]">Résultat positif</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
          Vous êtes éligible !
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Vos réponses indiquent qu&apos;un parcours GLP-1 pourrait vous convenir. Créez maintenant
          votre compte pour remplir le questionnaire médical — environ 5 minutes, sans engagement.
        </p>

        {/* Étapes visuelles */}
        <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { n: "1", label: "Créer votre compte", done: true },
            { n: "2", label: "Questionnaire médical", done: false },
            { n: "3", label: "Évaluation IPS", done: false },
          ].map((s) => (
            <div key={s.n} className={`rounded-xl p-2.5 ${s.done ? "bg-[#F0F7F4]" : "bg-slate-50"}`}>
              <span className={`text-[10px] font-bold ${s.done ? "text-[#1D4D3A]" : "text-slate-400"}`}>
                Étape {s.n}
              </span>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>

        <Link
          href={INSCRIPTION_QUESTIONNAIRE}
          className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
        >
          Créer mon compte et continuer
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </Link>
        <p className="mt-3 text-[11px] text-slate-400">Sans carte de crédit · Annulation à tout moment</p>
      </ResultCard>
    );
  }

  if (status === "NOT_ELIGIBLE") {
    return (
      <ResultCard border="border-orange-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl">🌿</div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-orange-500">Résultat</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
          Votre santé reste notre priorité
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          D&apos;après vos réponses, le GLP-1 n&apos;est pas recommandé sans un bilan médical approfondi.
          Ce n&apos;est pas un refus définitif — chaque parcours est unique. Consultez votre médecin
          ou composez le 811 pour un accompagnement adapté.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://www.quebec.ca/sante/trouver-une-ressource/info-sante-811"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-6 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
          >
            Info-Santé 811
          </a>
          <Link
            href="/eligibilite"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Recommencer le test
          </Link>
        </div>
      </ResultCard>
    );
  }

  return (
    <ResultCard border="border-blue-200">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">🔍</div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-500">À évaluer</p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
        Votre dossier sera évalué
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Certaines de vos réponses méritent une revue par un professionnel Anne-sante. Vous pouvez
        quand même poursuivre le questionnaire — notre équipe confirmera votre admissibilité.
      </p>
      <Link
        href={INSCRIPTION_QUESTIONNAIRE}
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-6 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
      >
        Créer mon compte et continuer
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </Link>
    </ResultCard>
  );
}

export default function EligibiliteResultatPage() {
  return (
    <div className="py-4">
      <p className="mb-8 text-center text-xs font-bold uppercase tracking-wider text-[#1D4D3A]">
        Résultat · Éligibilité
      </p>
      <Suspense
        fallback={
          <div className="mx-auto max-w-lg animate-pulse rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-xl">
            Chargement de votre résultat…
          </div>
        }
      >
        <EligibiliteResultatContent />
      </Suspense>
    </div>
  );
}
