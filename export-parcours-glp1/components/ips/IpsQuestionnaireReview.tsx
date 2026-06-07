"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireSectionsView } from "@/components/ips/QuestionnaireSectionsView";

type QuestionnaireDetail = {
  questionnaire: {
    id: string;
    status: string;
    height: number;
    weight: number;
    bmi: number;
    targetWeight: number;
    medicalHistory: Record<string, unknown>;
    currentMedications: unknown;
    allergies: unknown;
    hasTried: boolean;
    previousAttempts: string | null;
    motivations: string;
    ipsNotes: string | null;
    user: { prenom: string; email: string };
    medicationFulfillment: { id: string } | null;
  };
  aiSummary: string;
  age: number | null;
};

const MEDICATIONS = [
  { value: "Ozempic (sémaglutide)", label: "Ozempic" },
  { value: "Wegovy (sémaglutide)", label: "Wegovy" },
  { value: "Sémaglutide générique", label: "Générique" },
];

const DOSES = ["0,25 mg", "0,5 mg", "1 mg", "1,7 mg", "2,4 mg"];

type Props = { questionnaireId: string };

export function IpsQuestionnaireReview({ questionnaireId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<QuestionnaireDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [ipsNotes, setIpsNotes] = useState("");
  const [medication, setMedication] = useState(MEDICATIONS[0].value);
  const [dosage, setDosage] = useState(DOSES[0]);
  const [duration, setDuration] = useState(1);
  const [refills, setRefills] = useState(2);
  const [instructions, setInstructions] = useState(
    "Injecter sous-cutanément une fois par semaine, même jour chaque semaine.",
  );
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/ips/questionnaires/${questionnaireId}`);
    if (!res.ok) {
      setError("Impossible de charger le dossier.");
      setLoading(false);
      return;
    }
    const json = (await res.json()) as QuestionnaireDetail;
    setData(json);
    setIpsNotes(json.questionnaire.ipsNotes ?? "");
    setLoading(false);
  }, [questionnaireId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/ips/questionnaires/${questionnaireId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Action échouée");
      return null;
    }
    return res.json();
  }

  if (loading) {
    return <p className="text-sm text-[#6B7280]">Chargement du dossier…</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-600">{error ?? "Dossier introuvable"}</p>;
  }

  const q = data.questionnaire;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#3EBD93]">
          Dossier patient
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#1A1A2E]">{q.user.prenom}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          IMC {q.bmi.toFixed(1)} · {data.age != null ? `${data.age} ans` : "Âge non précisé"} ·{" "}
          Statut : {q.status}
        </p>
      </header>

      <section className="rounded-2xl border border-[#C8E6D9] bg-[#F0FBF7] p-6">
        <h2 className="text-sm font-bold text-[#1D4D3A]">Résumé IA</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A2E]">{data.aiSummary}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Données complètes</h2>
        <QuestionnaireSectionsView q={q} />
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Notes IPS</h2>
        <textarea
          className="mt-3 w-full rounded-xl border border-[#E5E7EB] p-3 text-sm"
          rows={4}
          value={ipsNotes}
          onChange={(e) => setIpsNotes(e.target.value)}
          placeholder="Notes cliniques…"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void patch({ action: "save_notes", ipsNotes })}
          className="mt-3 text-sm font-semibold text-[#1D4D3A]"
        >
          Enregistrer les notes
        </button>
      </section>

      {q.status !== "PRESCRIPTION_ISSUED" ? (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Rédiger l&apos;ordonnance</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Médicament
              <select
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-2"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
              >
                {MEDICATIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Dose initiale
              <select
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-2"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              >
                {DOSES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Durée (mois)
              <input
                type="number"
                min={1}
                max={12}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-2"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Renouvellements
              <input
                type="number"
                min={0}
                max={12}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-2"
                value={refills}
                onChange={(e) => setRefills(Number(e.target.value))}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Instructions
              <textarea
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-2"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const result = await patch({
                  action: "approve",
                  ipsNotes,
                  medication,
                  dosage,
                  duration,
                  refills,
                  instructions,
                });
                if (result) void load();
              }}
              className="rounded-xl bg-[#3EBD93] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Approuver et générer l&apos;ordonnance
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ action: "refer", ipsNotes })}
              className="rounded-xl border border-[#1D4D3A] px-5 py-2.5 text-sm font-semibold text-[#1D4D3A]"
            >
              Référer au médecin superviseur
            </button>
          </div>

          <div className="mt-6 border-t border-[#E5E7EB] pt-6">
            <label className="text-sm font-medium text-[#1A1A2E]">Rejeter avec motif</label>
            <textarea
              className="mt-2 w-full rounded-lg border border-[#E5E7EB] p-2 text-sm"
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const result = await patch({
                  action: "reject",
                  rejectReason,
                  ipsNotes,
                });
                if (result) router.push("/dashboard/ips");
              }}
              className="mt-3 text-sm font-semibold text-red-600"
            >
              Rejeter le dossier
            </button>
          </div>
        </section>
      ) : (
        <p className="rounded-xl bg-[#F0FBF7] p-4 text-sm text-[#1D4D3A]">
          Ordonnance émise
          {q.medicationFulfillment
            ? ` — ID livraison : ${q.medicationFulfillment.id}`
            : ""}
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
