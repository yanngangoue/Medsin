"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import type { EligibilityStatus } from "@prisma/client";
import { GLP1_PATIENT_DOSSIER_PATH } from "@/lib/patient/glp1-flow-routes";

type Decision = {
  id: string;
  kindLabel: string;
  eligibility: EligibilityStatus;
  medicationLabel: string | null;
  patientMessage: string | null;
  createdAt: string;
  decidedBy: string;
};

export function PatientPrescriptionCard() {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/patient/clinical-decision");
    if (res.ok) {
      const data = (await res.json()) as { decision: Decision | null };
      setDecision(data.decision);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Chargement de la décision clinique…</p>
      </section>
    );
  }

  if (!decision) {
    return null;
  }

  const dateFr = new Date(decision.createdAt).toLocaleString("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section
      className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-white p-6 shadow-sm"
      aria-labelledby="prescription-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-800">
            Décision de l&apos;équipe médicale
          </p>
          <h2 id="prescription-title" className="mt-1 text-lg font-bold text-slate-900">
            {decision.kindLabel}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Par {decision.decidedBy} · {dateFr}
          </p>
        </div>
        <EligibilityBadge status={decision.eligibility} />
      </div>

      {decision.medicationLabel ? (
        <p className="mt-4 text-sm text-slate-700">
          <span className="font-semibold">Traitement indiqué :</span>{" "}
          {decision.medicationLabel}
        </p>
      ) : null}

      {decision.patientMessage ? (
        <div className="mt-4 rounded-xl border border-violet-100 bg-white/90 px-4 py-3 text-sm leading-relaxed text-slate-800">
          {decision.patientMessage}
        </div>
      ) : null}

      <Link
        href={GLP1_PATIENT_DOSSIER_PATH}
        className="mt-4 inline-flex text-sm font-semibold text-[#1D9E75] hover:underline"
      >
        Voir le détail de mon dossier GLP-1 →
      </Link>
    </section>
  );
}
