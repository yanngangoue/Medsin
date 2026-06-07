"use client";

import { useState } from "react";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";
import type { WeightProgramPublic } from "@/lib/patient/weight-program";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultWeight?: number;
  onSuccess: (coachMessage: AiCoachMessagePublic | null, program: WeightProgramPublic | null) => void;
};

const NAUSEE_LABELS = ["Aucune", "Légère", "Modérée", "Marquée", "Forte", "Sévère"];

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition ${n <= value ? "text-amber-400" : "text-slate-300"}`}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function AnneCoachCheckInModal({ open, onClose, defaultWeight, onSuccess }: Props) {
  const [weight, setWeight] = useState(defaultWeight?.toString() ?? "");
  const [energie, setEnergie] = useState(3);
  const [sommeil, setSommeil] = useState(7);
  const [nausee, setNausee] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight.replace(",", "."));
    if (!Number.isFinite(w) || w <= 0) {
      setError("Entrez un poids valide en kg.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/patient/weight-program/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: w,
          energie,
          sommeil,
          nausee,
          notes: notes.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        program?: WeightProgramPublic;
        coachMessage?: AiCoachMessagePublic | null;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Impossible d'enregistrer le check-in.");
      }

      onSuccess(data.coachMessage ?? null, data.program ?? null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="text-lg font-bold text-slate-900">Mon check-in de la semaine</h2>
        <p className="mt-1 text-sm text-slate-500">Anne analysera vos données dès l&apos;envoi.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-5">
          <div>
            <label htmlFor="checkin-weight" className="text-sm font-medium text-slate-700">
              Poids actuel (kg)
            </label>
            <input
              id="checkin-weight"
              type="number"
              step="0.1"
              min="30"
              max="400"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D4D3A] focus:ring-2 focus:ring-[#1D4D3A]/15"
              required
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Énergie cette semaine</p>
            <div className="mt-2">
              <StarRow value={energie} onChange={setEnergie} />
            </div>
          </div>

          <div>
            <label htmlFor="checkin-sommeil" className="flex justify-between text-sm font-medium text-slate-700">
              <span>Sommeil moyen</span>
              <span className="text-[#1D4D3A]">{sommeil} h</span>
            </label>
            <input
              id="checkin-sommeil"
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={sommeil}
              onChange={(e) => setSommeil(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#1D4D3A]"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>4 h</span>
              <span>10 h</span>
            </div>
          </div>

          <div>
            <label htmlFor="checkin-nausee" className="flex justify-between text-sm font-medium text-slate-700">
              <span>Nausées</span>
              <span className="text-[#1D4D3A]">{NAUSEE_LABELS[nausee]}</span>
            </label>
            <input
              id="checkin-nausee"
              type="range"
              min={0}
              max={5}
              step={1}
              value={nausee}
              onChange={(e) => setNausee(parseInt(e.target.value, 10))}
              className="mt-2 w-full accent-[#1D4D3A]"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>0</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label htmlFor="checkin-notes" className="text-sm font-medium text-slate-700">
              Note optionnelle
            </label>
            <textarea
              id="checkin-notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1D4D3A] focus:ring-2 focus:ring-[#1D4D3A]/15"
              placeholder="Effets secondaires, humeur, questions…"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#1D4D3A] py-3 text-sm font-semibold text-white transition hover:bg-[#163d2e] disabled:opacity-50"
          >
            {saving ? "Envoi…" : "Envoyer à Anne →"}
          </button>
        </form>
      </div>
    </div>
  );
}
