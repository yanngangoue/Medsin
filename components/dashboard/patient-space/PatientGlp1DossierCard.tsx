import Link from "next/link";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import {
  GLP1_EVALUATION_PATH,
  GLP1_PATIENT_DOSSIER_PATH,
} from "@/lib/patient/glp1-flow-routes";
import {
  patientStatusHeadline,
  patientStatusTheme,
} from "@/lib/patient/patient-space";
import { glp1QuestionnaireResumeUrl } from "@/lib/patient/glp1-wizard-progress";

type Props = {
  eligibility: EligibilityStatus;
  hasGlp1Dossier: boolean;
  glp1Summary: Glp1DossierSummary | null;
};

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/90 px-4 py-3 ring-1 ring-black/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">{value}</p>
    </div>
  );
}

export function PatientGlp1DossierCard({
  eligibility,
  hasGlp1Dossier,
  glp1Summary,
}: Props) {
  const theme = patientStatusTheme(eligibility);
  const headline = patientStatusHeadline(eligibility);
  const imcDisplay =
    glp1Summary?.imc != null && glp1Summary.imc > 0 ? String(glp1Summary.imc) : "—";

  if (!hasGlp1Dossier || !glp1Summary) {
    return (
      <section
        id="glp-dossier"
        className="overflow-hidden rounded-2xl border border-dashed border-[#1D9E75]/40 bg-white shadow-sm scroll-mt-24"
        aria-labelledby="glp-empty-title"
      >
        <div className="border-l-4 border-[#1D9E75] px-6 py-8 sm:px-8">
          <h2 id="glp-empty-title" className="text-xl font-bold text-slate-900">
            Commencez votre évaluation GLP-1
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
            Environ 5 minutes. Vos réponses seront revues par un professionnel avant toute
            décision thérapeutique.
          </p>
          <Link
            href={GLP1_EVALUATION_PATH}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#1D9E75] px-8 text-sm font-bold text-white shadow-lg transition hover:bg-[#178f6a]"
          >
            Démarrer l&apos;évaluation
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="glp-dossier"
      className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-md ring-1 ${theme.ring}`}
      aria-labelledby="glp-dossier-title"
    >
      <div
        className="border-l-[5px] px-6 py-6 sm:px-8 sm:py-8"
        style={{ borderLeftColor: theme.accent, backgroundColor: theme.accentSoft }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Dossier principal
            </p>
            <h2 id="glp-dossier-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Gestion du poids · GLP-1
            </h2>
          </div>
          <EligibilityBadge status={eligibility} />
        </div>

        <div
          className="mt-5 flex gap-3 rounded-xl px-4 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: theme.accent }}
            aria-hidden
          >
            {theme.icon}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900">{headline.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{headline.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 px-6 py-6 sm:grid-cols-3 sm:px-8">
        <MetricTile label="IMC (simulation)" value={imcDisplay} />
        <MetricTile label="Objectif" value={glp1Summary.goal} />
        <MetricTile label="Poids visé" value={glp1Summary.idealWeight} />
      </div>

      <dl className="grid gap-3 border-t border-slate-100 px-6 pb-6 text-sm sm:grid-cols-2 sm:px-8">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-slate-500">Mesures déclarées</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{glp1Summary.measures}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-slate-500">Dossier soumis le</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{glp1Summary.submittedAt}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:flex-row sm:px-8">
        <Link
          href={GLP1_PATIENT_DOSSIER_PATH}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-bold text-white shadow-md transition hover:bg-[#178f6a]"
        >
          Voir mon dossier complet
        </Link>
        <Link
          href={glp1QuestionnaireResumeUrl()}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:bg-white/80"
        >
          Modifier mes réponses
        </Link>
      </div>
    </section>
  );
}
