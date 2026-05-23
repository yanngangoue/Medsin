"use client";

import { useState } from "react";

type Decision = "APPROUVE" | "REFUSE" | "INFO_REQUISE";

type Props = {
  medecinName: string;
  dossierId: string;
  currentStatus: string;
  onDecided: () => void;
};

export function DecisionMedicale({
  medecinName,
  dossierId,
  currentStatus,
  onDecided,
}: Props) {
  const [decision, setDecision] = useState<Decision | "">("");
  const [notes, setNotes] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalStatuses = ["APPROUVE", "REFUSE", "INFO_REQUISE"];
  const isFinal = finalStatuses.includes(currentStatus);

  const notesOk = notes.trim().length >= 50;
  const motifOk = decision !== "REFUSE" || motifRefus.trim().length >= 10;
  const canSubmit = Boolean(decision) && notesOk && motifOk && !isFinal;

  async function submit() {
    if (!decision || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/medecin/dossier/${dossierId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notesMedecin: notes.trim(),
          motifRefus: decision === "REFUSE" ? motifRefus.trim() : undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: unknown };
        setError(typeof data.error === "string" ? data.error : "Échec de l'enregistrement");
        return;
      }
      setConfirmOpen(false);
      onDecided();
    } finally {
      setSubmitting(false);
    }
  }

  if (isFinal) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Décision enregistrée ({currentStatus}). Modification impossible.
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-2xl border-2 border-[#16a34a]/30 bg-white p-5 shadow-md">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#16a34a]">
        Décision médicale
      </h2>
      <p className="mt-1 text-xs text-slate-600">Dr. {medecinName}</p>

      <label className="mt-4 block text-xs font-medium text-slate-700">
        Notes cliniques * (min. 50 caractères)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Observations cliniques du médecin…"
      />
      <p className="text-[10px] text-slate-400">{notes.trim().length} / 50 min.</p>

      <fieldset className="mt-4 space-y-2">
        <legend className="sr-only">Décision</legend>
        {(
          [
            ["APPROUVE", "Approuver — prescrire GLP-1"],
            ["REFUSE", "Refuser — avec motif"],
            ["INFO_REQUISE", "Demander des informations"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="radio"
              name="decision"
              value={value}
              checked={decision === value}
              onChange={() => setDecision(value)}
              className="mt-1"
            />
            {label}
          </label>
        ))}
      </fieldset>

      {decision === "REFUSE" ? (
        <>
          <label className="mt-3 block text-xs font-medium text-slate-700">
            Motif de refus *
          </label>
          <textarea
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => setConfirmOpen(true)}
        className="mt-4 w-full rounded-lg bg-[#16a34a] py-2.5 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-40"
      >
        Confirmer ma décision
      </button>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-slate-900">Confirmer la décision</h3>
            <p className="mt-2 text-sm text-slate-600">
              Confirmez-vous votre décision ? Cette action sera enregistrée avec votre nom et
              horodatage. Aucune ordonnance ne sera émise automatiquement.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="flex-1 rounded-lg bg-[#16a34a] py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Enregistrement…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
