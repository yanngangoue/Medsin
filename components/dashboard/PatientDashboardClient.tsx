"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { MessageThread } from "@/components/messages/MessageThread";
import { PatientServicesHub } from "@/components/patient/PatientServicesHub";
import { objectifLabel } from "@/lib/questionnaire-labels";

type Questionnaire = {
  objectif: string;
  poids: number;
  taille: number;
  imc: number;
  glpAntecedent: boolean;
  glpLequel: string | null;
  antecedents: string[];
  medicaments: boolean;
  medicamentsDesc: string | null;
  submittedAt: Date | string;
} | null;

type Props = {
  prenom: string;
  email: string;
  userId: string;
  eligibility: EligibilityStatus;
  questionnaire: Questionnaire;
  profileBmi: number | null;
  hasGlp1Dossier: boolean;
};

export function PatientDashboardClient({
  prenom,
  email,
  userId,
  eligibility,
  questionnaire,
  profileBmi,
  hasGlp1Dossier,
}: Props) {
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/messages/staff-contact");
      if (!res.ok) return;
      const data = (await res.json()) as { peer: { id: string } | null };
      setStaffId(data.peer?.id ?? null);
    })();
  }, []);

  const imc = profileBmi ?? questionnaire?.imc ?? null;
  const hasQuestionnaire = Boolean(questionnaire);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PatientServicesHub
        variant="connected"
        prenom={prenom}
        showAuthLinks={false}
        hubContext={{ hasQuestionnaire, eligibility, hasGlp1Dossier }}
      />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
        <p className="text-center text-sm text-slate-500">
          <Link href="/?browse=1" className="font-medium text-[#1D9E75] hover:underline">
            Voir la présentation publique des services
          </Link>
        </p>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Résumé profil</h2>
            <p className="mt-2 text-sm text-slate-600">{email}</p>
            <p className="mt-1 text-sm text-slate-600">
              Objectif :{" "}
              <span className="font-medium text-slate-900">
                {questionnaire ? objectifLabel(questionnaire.objectif) : "—"}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              IMC : <span className="font-medium text-slate-900">{imc ?? "—"}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Éligibilité GLP-1</h2>
            <div className="mt-3">
              <EligibilityBadge status={eligibility} />
            </div>
            {hasGlp1Dossier ? (
              <Link
                href="/onboarding/confirmation?service=gestion-poids"
                className="mt-4 inline-flex text-sm font-medium text-[#16a34a] hover:underline"
              >
                Voir le détail de mon dossier GLP-1 →
              </Link>
            ) : (
              <Link
                href="/onboarding/gestion-poids/evaluation"
                className="mt-4 inline-flex text-sm font-medium text-[#16a34a] hover:underline"
              >
                Compléter l&apos;évaluation GLP-1 →
              </Link>
            )}
          </div>
        </section>

        {questionnaire ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Historique questionnaire</h2>
            <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Poids / taille</dt>
                <dd className="font-medium">
                  {questionnaire.poids} kg / {questionnaire.taille} cm
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">GLP-1 antérieur</dt>
                <dd className="font-medium">{questionnaire.glpAntecedent ? "Oui" : "Non"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Antécédents</dt>
                <dd className="font-medium">{questionnaire.antecedents.join(", ")}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {staffId ? (
          <MessageThread peerId={staffId} currentUserId={userId} title="Messagerie avec l'équipe médicale" />
        ) : (
          <p className="text-sm text-slate-500">Messagerie indisponible — aucun professionnel configuré.</p>
        )}
      </main>
    </div>
  );
}
