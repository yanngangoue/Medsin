"use client";

import { useState } from "react";

type Props = {
  patientId: string;
  hasGlp1: boolean;
};

export function AdminDoctorAiBrief({ patientId, hasGlp1 }: Props) {
  const [brief, setBrief] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/ai-brief`, {
        method: "POST",
      });
      const json = (await res.json().catch(() => ({}))) as {
        brief?: string;
        disclaimer?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Impossible de générer le brief.");
        return;
      }
      setBrief(json.brief ?? null);
      setDisclaimer(json.disclaimer ?? null);
    } finally {
      setLoading(false);
    }
  }

  if (!hasGlp1) {
    return (
      <p className="text-sm text-slate-500">
        Aucune évaluation GLP-1 — brief IA indisponible.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Brief de revue (IA)</h3>
          <p className="mt-1 text-xs text-slate-600">
            Aide à la lecture du dossier — à valider par le médecin.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void generate()}
          className="rounded-lg bg-violet-700 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
        >
          {loading ? "Génération…" : brief ? "Régénérer" : "Générer le brief"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {brief ? (
        <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
          {brief}
        </div>
      ) : null}
      {disclaimer ? (
        <p className="mt-2 text-[10px] text-slate-500">{disclaimer}</p>
      ) : null}
    </section>
  );
}
