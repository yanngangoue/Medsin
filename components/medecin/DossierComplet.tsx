"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SuggestionSysteme } from "@/components/medecin/SuggestionSysteme";
import { DecisionMedicale } from "@/components/medecin/DecisionMedicale";
import { Glp1DoctorDossierPanel } from "@/components/admin/Glp1DoctorDossierPanel";
import { AdminMessagerie } from "@/components/admin/AdminMessagerie";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseGlp1HealthInfo, type Glp1HealthInfoPayload } from "@/lib/patient/glp1-dossier";
import type { EligibilityStatus } from "@prisma/client";

type Props = {
  dossierId: string;
  staffUserId: string;
};

function imcColor(imc: number | null): string {
  if (imc == null) return "text-slate-700";
  if (imc >= 30) return "text-[#16a34a]";
  if (imc >= 27) return "text-amber-600";
  return "text-red-600";
}

function formatElapsed(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  if (h > 48) return `Soumis il y a ${Math.floor(h / 24)} j`;
  if (h > 0) return `Soumis il y a ${h}h${m > 0 ? `${m}min` : ""}`;
  return `Soumis il y a ${m} min`;
}

const STATUS_LABELS: Record<string, string> = {
  EXCLU_PRE_DIAGNOSTIC: "Exclu au tri pré-diagnostique",
  EN_ATTENTE_MEDECIN: "En attente — revue professionnelle",
  EN_COURS_REVISION: "Analyse en cours",
  INFO_REQUISE: "Informations requises",
  EN_ATTENTE_CONSULTATION: "Approuvé — consultation virtuelle",
  APPROUVE: "Approuvé",
  REFUSE: "Refusé",
  ANNULE: "Annulé",
};

export function DossierComplet({ dossierId, staffUserId }: Props) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<{
    dossier: {
      id: string;
      status: string;
      createdAt: string;
      suggestionImc: number | null;
      suggestionEligibilite: string | null;
      patient: {
        id: string;
        prenom: string;
        name: string | null;
        email: string;
        profile: { bmi: number | null; age: number | null; weightKg: number | null; heightCm: number | null; healthInfo: unknown; medicalHistory: string | null; eligibility: string } | null;
        questionnaire: {
          objectif: string;
          poids: number;
          taille: number;
          imc: number;
          glpAntecedent: boolean;
          glpLequel: string | null;
          antecedents: string[];
          medicaments: boolean;
        } | null;
      };
    };
    glp1: Glp1HealthInfoPayload | null;
    medecin: { id: string; name: string };
    prescriptionsHistory: { id: string; medicament: string; status: string; createdAt: string }[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/medecin/dossier/${dossierId}`);
    if (res.ok) {
      const data = await res.json();
      const glp1 = data.glp1 ?? parseGlp1HealthInfo(data.dossier?.healthInfoSnapshot ?? data.dossier?.patient?.profile?.healthInfo);
      setPayload({ ...data, glp1 });
    }
    setLoading(false);
  }, [dossierId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="p-8 text-slate-500">Chargement du dossier…</p>;
  if (!payload) return <p className="p-8 text-slate-500">Dossier introuvable.</p>;

  const { dossier, glp1, medecin, prescriptionsHistory } = payload;
  const patient = dossier.patient;
  const name = patient.prenom || patient.name || "Patient";
  const imc = dossier.suggestionImc ?? patient.profile?.bmi ?? patient.questionnaire?.imc ?? null;
  const eligibility = (patient.profile?.eligibility ?? "PENDING") as EligibilityStatus;

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/medecin/file" className="text-sm text-[#16a34a] hover:underline">
              ← File de travail
            </Link>
            <h1 className="mt-2 text-xl font-bold text-slate-900">{name}</h1>
            <p className="text-sm text-slate-600">
              {patient.profile?.age ? `${patient.profile.age} ans · ` : ""}
              {formatElapsed(dossier.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
            {STATUS_LABELS[dossier.status] ?? dossier.status}
          </span>
        </div>
        {dossier.status === "APPROUVE" ? (
          <Link
            href={`/medecin/ordonnance/${dossierId}`}
            className="mt-4 inline-block rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white"
          >
            Rédiger et signer l&apos;ordonnance
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">IMC et mesures</h2>
            <p className={`mt-2 text-4xl font-bold ${imcColor(imc)}`}>
              {imc != null ? imc.toFixed(1) : "—"}
            </p>
            {patient.profile?.weightKg && patient.profile?.heightCm ? (
              <p className="text-sm text-slate-600">
                {patient.profile.weightKg} kg · {patient.profile.heightCm} cm
              </p>
            ) : null}
          </section>

          <SuggestionSysteme
            imc={imc}
            suggestionText={dossier.suggestionEligibilite}
          />

          {glp1 ? (
            <Glp1DoctorDossierPanel
              payload={glp1}
              eligibility={eligibility}
              medicalHistory={patient.profile?.medicalHistory ?? null}
            />
          ) : null}

          {patient.questionnaire ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Questionnaire</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Objectif : {objectifLabel(patient.questionnaire.objectif)}</li>
                <li>
                  {patient.questionnaire.poids} kg / {patient.questionnaire.taille} cm
                </li>
                <li>GLP-1 antérieur : {patient.questionnaire.glpAntecedent ? "Oui" : "Non"}</li>
              </ul>
            </section>
          ) : null}

          {prescriptionsHistory.length > 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Prescriptions antérieures</h2>
              <ul className="mt-2 text-sm text-slate-700">
                {prescriptionsHistory.map((p) => (
                  <li key={p.id}>
                    {p.medicament} — {p.status} ({new Date(p.createdAt).toLocaleDateString("fr-CA")})
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <AdminMessagerie peerId={patient.id} currentUserId={staffUserId} title="Messages" />
        </div>

        <DecisionMedicale
          medecinName={medecin.name}
          dossierId={dossierId}
          currentStatus={dossier.status}
          onDecided={() => void load()}
        />
      </div>
    </div>
  );
}
