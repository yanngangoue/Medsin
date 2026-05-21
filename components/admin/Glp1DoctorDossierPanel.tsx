"use client";

import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import {
  buildGlp1DoctorReport,
  type Glp1DoctorSection,
} from "@/lib/patient/glp1-doctor-view";
import type { Glp1HealthInfoPayload } from "@/lib/patient/glp1-dossier";

type Props = {
  payload: Glp1HealthInfoPayload;
  eligibility: EligibilityStatus;
  medicalHistory: string | null;
};

function SectionBlock({ section }: { section: Glp1DoctorSection }) {
  return (
    <div className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {section.title}
      </h3>
      <dl className="mt-3 space-y-2">
        {section.fields.map((field, i) => (
          <div
            key={`${section.title}-${i}`}
            className={
              field.highlight === "alert"
                ? "rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2"
                : "px-0.5"
            }
          >
            {field.label ? (
              <dt className="text-[11px] font-medium text-slate-500">{field.label}</dt>
            ) : null}
            <dd className="text-sm leading-snug text-slate-800">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Glp1DoctorDossierPanel({ payload, eligibility, medicalHistory }: Props) {
  const report = buildGlp1DoctorReport(payload);
  const submittedLabel = new Date(payload.submittedAt).toLocaleString("fr-CA", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-white shadow-sm ring-1 ring-emerald-100/80">
      <div className="border-b border-emerald-100/80 bg-emerald-50/40 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Télésanté — évaluation GLP-1
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Réponses saisies par le patient
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Soumis le {submittedLabel} · Simulation : {payload.eligibilityLabel}
            </p>
          </div>
          <EligibilityBadge status={eligibility} />
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
          Ces données sont déclarées par le patient en ligne. Elles ne remplacent pas un examen
          clinique. Toute prescription relève de votre jugement professionnel.
        </p>

        {report.alerts.length > 0 ? (
          <ul className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
            {report.alerts.map((a) => (
              <li key={a} className="flex gap-2">
                <span aria-hidden>⚠</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="IMC" value={report.imc > 0 ? String(report.imc) : "—"} />
          <Metric label="Âge" value={`${report.age} ans`} />
          <Metric
            label="Antécédents (synthèse)"
            value={
              medicalHistory
                ? medicalHistory.length > 48
                  ? `${medicalHistory.slice(0, 48)}…`
                  : medicalHistory
                : "—"
            }
            title={medicalHistory && medicalHistory.length > 48 ? medicalHistory : undefined}
          />
        </div>

        {report.sections.map((section) => (
          <SectionBlock key={section.title} section={section} />
        ))}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2" title={title}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
