"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/admin/EligibilityBadge";
import { EligibilityActions } from "@/components/admin/EligibilityActions";
import { AdminMessagerie } from "@/components/admin/AdminMessagerie";
import { Glp1DoctorDossierPanel } from "@/components/admin/Glp1DoctorDossierPanel";
import { eligibilityLabelFr } from "@/lib/eligibility-labels";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseGlp1HealthInfo } from "@/lib/patient/glp1-dossier";

type HistoryRow = {
  id: string;
  oldStatus: EligibilityStatus;
  newStatus: EligibilityStatus;
  note: string | null;
  createdAt: string;
  changedBy: { prenom: string | null; name: string | null; role: string };
};

type PatientDetail = {
  id: string;
  prenom: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  profile: {
    eligibility: EligibilityStatus;
    bmi: number | null;
    weightKg: number | null;
    heightCm: number | null;
    medicalHistory: string | null;
    healthInfo: unknown;
  } | null;
  questionnaire: {
    objectif: string;
    poids: number;
    taille: number;
    imc: number;
    glpAntecedent: boolean;
    glpLequel: string | null;
    antecedents: string[];
    medicaments: boolean;
    medicamentsDesc: string | null;
  } | null;
};

type Props = {
  patientId: string;
  staffUserId: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PatientDossier({ patientId, staffUserId }: Props) {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/patients/${patientId}`);
    if (res.ok) {
      const data = (await res.json()) as {
        patient: PatientDetail;
        eligibilityHistory: HistoryRow[];
      };
      setPatient(data.patient);
      setHistory(data.eligibilityHistory ?? []);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setEligibility(status: EligibilityStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/eligibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note.trim() || undefined }),
      });
      if (res.ok) await load();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-slate-500">Chargement du dossier…</p>;
  }

  if (!patient) {
    return <p className="p-8 text-slate-500">Patient introuvable.</p>;
  }

  const displayName = patient.prenom || patient.name || "Patient";
  const eligibility = patient.profile?.eligibility ?? "PENDING";
  const bmi = patient.profile?.bmi ?? patient.questionnaire?.imc ?? null;
  const glp1 = parseGlp1HealthInfo(patient.profile?.healthInfo);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Link href="/admin/patients" className="text-sm font-medium text-[#16a34a] hover:underline">
          ← Retour aux patients
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{displayName}</h1>
        <p className="text-sm text-slate-600">{patient.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {patient.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={patient.image}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16a34a]/10 text-lg font-bold text-[#16a34a]">
                  {initials(displayName)}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-600">{patient.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Inscrit le{" "}
                  {new Date(patient.createdAt).toLocaleDateString("fr-CA", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase text-slate-500">IMC</p>
              <p className="text-4xl font-bold text-[#16a34a]">
                {bmi != null ? bmi.toFixed(1) : "—"}
              </p>
              {patient.profile?.weightKg && patient.profile?.heightCm ? (
                <p className="mt-1 text-sm text-slate-600">
                  {patient.profile.weightKg} kg · {patient.profile.heightCm} cm
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <EligibilityBadge status={eligibility} />
            </div>

            <div className="mt-4">
              <EligibilityActions updating={updating} onSet={(s) => void setEligibility(s)} />
            </div>

            <label className="mt-4 block text-xs font-medium text-slate-600">
              Note médicale
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Note interne pour ce changement de statut…"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Historique des statuts</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Aucun changement enregistré.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="border-t border-slate-100 pt-3 text-sm first:border-0 first:pt-0">
                    <p className="font-medium text-slate-800">
                      {eligibilityLabelFr(h.oldStatus)} → {eligibilityLabelFr(h.newStatus)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(h.createdAt).toLocaleString("fr-CA")} —{" "}
                      {h.changedBy.prenom || h.changedBy.name || "Staff"}
                    </p>
                    {h.note ? <p className="mt-1 text-slate-600">{h.note}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          {glp1 ? (
            <Glp1DoctorDossierPanel
              payload={glp1}
              eligibility={eligibility}
              medicalHistory={patient.profile?.medicalHistory ?? null}
            />
          ) : null}

          {patient.questionnaire ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Questionnaire</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Objectif : {objectifLabel(patient.questionnaire.objectif)}</li>
                <li>
                  Poids / taille : {patient.questionnaire.poids} kg /{" "}
                  {patient.questionnaire.taille} cm — IMC {patient.questionnaire.imc}
                </li>
                <li>
                  GLP-1 antérieur : {patient.questionnaire.glpAntecedent ? "Oui" : "Non"}
                  {patient.questionnaire.glpLequel
                    ? ` (${patient.questionnaire.glpLequel})`
                    : ""}
                </li>
                <li>Antécédents : {patient.questionnaire.antecedents.join(", ") || "—"}</li>
                <li>
                  Médicaments :{" "}
                  {patient.questionnaire.medicaments
                    ? patient.questionnaire.medicamentsDesc || "Oui"
                    : "Non"}
                </li>
              </ul>
            </section>
          ) : !glp1 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Aucun questionnaire enregistré.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <AdminMessagerie
          peerId={patientId}
          currentUserId={staffUserId}
          title={`Conversation avec ${displayName}`}
        />
      </div>
    </div>
  );
}
