"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { AdminClinicalPrescriptionPanel } from "@/components/admin/AdminClinicalPrescriptionPanel";
import { AdminDoctorAiBrief } from "@/components/admin/AdminDoctorAiBrief";
import { AdminTeleconsultSchedule } from "@/components/admin/AdminTeleconsultSchedule";
import { Glp1DoctorDossierPanel } from "@/components/admin/Glp1DoctorDossierPanel";
import { MessageThread } from "@/components/messages/MessageThread";
import { PreviousPageButton } from "@/components/navigation/PreviousPageButton";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseGlp1HealthInfo } from "@/lib/patient/glp1-dossier";

type PatientDetail = {
  id: string;
  prenom: string;
  name: string | null;
  email: string;
  createdAt: string;
  profile: {
    eligibility: EligibilityStatus;
    bmi: number | null;
    weightKg: number | null;
    heightCm: number | null;
    age: number | null;
    gender: string | null;
    medicalHistory: string | null;
    healthInfo: unknown;
    fullName: string;
    dateOfBirth: string | null;
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

type Tab = "synthese" | "glp1" | "questionnaire" | "messages" | "rendez-vous";

type Props = {
  patientId: string;
  staffUserId: string;
  staffPrenom: string;
};

export function AdminPatientDetail({ patientId, staffUserId, staffPrenom }: Props) {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tab, setTab] = useState<Tab>("synthese");
  const [note, setNote] = useState("");
  const [patientMessage, setPatientMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/patients/${patientId}`);
    if (res.ok) {
      const data = (await res.json()) as { patient: PatientDetail };
      setPatient(data.patient);
      const glp1 = parseGlp1HealthInfo(data.patient.profile?.healthInfo);
      if (glp1) setTab("glp1");
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
        body: JSON.stringify({
          status,
          note: note.trim() || undefined,
          patientMessage: patientMessage.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNote("");
        setPatientMessage("");
        await load();
      }
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

  const eligibility = patient.profile?.eligibility ?? "PENDING";
  const glp1Payload = parseGlp1HealthInfo(patient.profile?.healthInfo);
  const displayName = patient.prenom || patient.name || "Patient";

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "synthese", label: "Synthèse", show: true },
    { id: "glp1", label: "Évaluation GLP-1", show: Boolean(glp1Payload) },
    { id: "questionnaire", label: "Questionnaire classique", show: Boolean(patient.questionnaire) },
    { id: "messages", label: "Messagerie", show: true },
    { id: "rendez-vous", label: "Téléconsultation", show: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">
              Télésanté métabolique — {staffPrenom}
            </p>
            <h1 className="text-xl font-semibold text-slate-900">{displayName}</h1>
            <p className="text-sm text-slate-600">{patient.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PreviousPageButton
              fallbackHref="/admin/patients?queue=a_revoir"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            />
            <Link
              href="/admin/patients?queue=a_revoir"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              File à revoir
            </Link>
            <Link
              href="/admin/patients"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Liste patients
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
          {tabs
            .filter((t) => t.show)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "border-[#16a34a] text-[#16a34a]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
        </nav>

        {tab === "synthese" ? (
          <div className="space-y-6">
            <AdminDoctorAiBrief patientId={patientId} hasGlp1={Boolean(glp1Payload)} />

            <AdminClinicalPrescriptionPanel
              patientId={patientId}
              currentEligibility={eligibility}
              onSaved={() => void load()}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center gap-3">
                <EligibilityBadge status={eligibility} />
                <span className="text-sm text-slate-600">
                  IMC {patient.profile?.bmi ?? patient.questionnaire?.imc ?? "—"}
                  {patient.profile?.weightKg
                    ? ` · ${patient.profile.weightKg} kg`
                    : ""}
                  {patient.profile?.heightCm
                    ? ` · ${patient.profile.heightCm} cm`
                    : ""}
                  {patient.profile?.age ? ` · ${patient.profile.age} ans` : ""}
                </span>
              </div>

              <label className="mt-4 block text-xs font-medium text-slate-600">
                Message au patient (e-mail + espace patient)
              </label>
              <textarea
                value={patientMessage}
                onChange={(e) => setPatientMessage(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Ex. : Votre dossier a été examiné. Prochaine étape…"
              />

              <label className="mt-3 block text-xs font-medium text-slate-600">
                Note clinique interne (optionnelle)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Ex. : à rappeler pour tension artérielle…"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <ActionBtn disabled={updating} onClick={() => void setEligibility("ELIGIBLE")}>
                  Valider — éligible GLP-1
                </ActionBtn>
                <ActionBtn disabled={updating} onClick={() => void setEligibility("NOT_ELIGIBLE")}>
                  Refuser — non éligible
                </ActionBtn>
                <ActionBtn
                  disabled={updating}
                  onClick={() => void setEligibility("MEDICAL_REVIEW_REQUIRED")}
                >
                  Mettre en revue médicale
                </ActionBtn>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                La prescription relève de votre responsabilité. Cette action met à jour le statut
                visible dans l&apos;espace patient.
              </p>
            </section>

            {!glp1Payload ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                Aucune évaluation GLP-1 enregistrée pour ce patient.
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "glp1" && glp1Payload ? (
          <Glp1DoctorDossierPanel
            payload={glp1Payload}
            eligibility={eligibility}
            medicalHistory={patient.profile?.medicalHistory ?? null}
          />
        ) : null}

        {tab === "questionnaire" && patient.questionnaire ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Questionnaire classique</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Objectif : {objectifLabel(patient.questionnaire.objectif)}</li>
              <li>
                Poids / taille : {patient.questionnaire.poids} kg / {patient.questionnaire.taille}{" "}
                cm
              </li>
              <li>GLP-1 antérieur : {patient.questionnaire.glpAntecedent ? "Oui" : "Non"}</li>
              {patient.questionnaire.glpLequel ? (
                <li>Traitement : {patient.questionnaire.glpLequel}</li>
              ) : null}
              <li>Antécédents : {patient.questionnaire.antecedents.join(", ")}</li>
              <li>Médicaments : {patient.questionnaire.medicaments ? "Oui" : "Non"}</li>
            </ul>
          </section>
        ) : null}

        {tab === "messages" ? (
          <MessageThread
            peerId={patientId}
            currentUserId={staffUserId}
            title={`Conversation avec ${displayName}`}
          />
        ) : null}

        {tab === "rendez-vous" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Consultations vidéo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Rendez-vous planifiés par le patient depuis son espace — même salle Jitsi pour vous
              deux.
            </p>
            <div className="mt-4">
              <AdminTeleconsultSchedule patientId={patientId} compact />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
