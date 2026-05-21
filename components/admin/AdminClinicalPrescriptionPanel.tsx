"use client";

import { useState } from "react";
import type { EligibilityStatus, PrescriptionMedication } from "@prisma/client";

type Props = {
  patientId: string;
  currentEligibility: EligibilityStatus;
  onSaved: () => void;
};

const MEDICATIONS: { value: PrescriptionMedication; label: string }[] = [
  { value: "SEMAGLUTIDE", label: "Semaglutide" },
  { value: "TIRZEPATIDE", label: "Tirzépatide" },
  { value: "LIRAGLUTIDE", label: "Liraglutide" },
  { value: "OTHER", label: "Autre" },
  { value: "NONE", label: "Aucun (suivi seul)" },
];

export function AdminClinicalPrescriptionPanel({
  patientId,
  currentEligibility,
  onSaved,
}: Props) {
  const [medication, setMedication] = useState<PrescriptionMedication>("SEMAGLUTIDE");
  const [eligibility, setEligibility] = useState<EligibilityStatus>(
    currentEligibility === "PENDING" ? "ELIGIBLE" : currentEligibility,
  );
  const [clinicalNote, setClinicalNote] = useState("");
  const [patientMessage, setPatientMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/clinical-decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eligibility,
          medication,
          clinicalNote: clinicalNote.trim() || undefined,
          patientMessage: patientMessage.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Enregistrement impossible.");
        return;
      }
      setPatientMessage("");
      setClinicalNote("");
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Prescription traçable</h3>
      <p className="mt-1 text-xs text-slate-600">
        Enregistre une décision nominative, visible par le patient, avec courriel de notification.
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Statut dossier
            <select
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value as EligibilityStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="ELIGIBLE">Éligible</option>
              <option value="MEDICAL_REVIEW_REQUIRED">Revue médicale</option>
              <option value="NOT_ELIGIBLE">Non éligible</option>
              <option value="PENDING">En attente</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Médicament
            <select
              value={medication}
              onChange={(e) => setMedication(e.target.value as PrescriptionMedication)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {MEDICATIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Message au patient (visible dans son espace + e-mail)
          <textarea
            value={patientMessage}
            onChange={(e) => setPatientMessage(e.target.value)}
            rows={3}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Ex. : Votre dossier est admissible. Prochaine étape : consultation de suivi…"
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Note clinique interne (non visible patient)
          <textarea
            value={clinicalNote}
            onChange={(e) => setClinicalNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !patientMessage.trim()}
          className="rounded-lg bg-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Enregistrer la prescription"}
        </button>
      </form>
    </section>
  );
}
