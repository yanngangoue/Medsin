"use client";

import { useState } from "react";

const MEDICAMENTS = [
  "Semaglutide (Ozempic)",
  "Semaglutide (Wegovy)",
  "Tirzepatide (Mounjaro)",
  "Liraglutide (Saxenda)",
] as const;

const DOSAGES = ["0.25mg / semaine (initiation)", "0.5mg / semaine", "1mg / semaine", "2mg / semaine"];
const DUREES = ["4 semaines", "8 semaines", "12 semaines"];

type Props = {
  dossierId: string;
  patientName: string;
  medecinName: string;
  license: string | null;
  numeroOrdonnance?: string;
  onCreated: (prescriptionId: string) => void;
};

export function FormulaireOrdonnance({
  dossierId,
  patientName,
  medecinName,
  license,
  onCreated,
}: Props) {
  const [medicament, setMedicament] = useState<string>(MEDICAMENTS[0]);
  const [dosage, setDosage] = useState(DOSAGES[0]);
  const [duree, setDuree] = useState(DUREES[0]);
  const [instructions, setInstructions] = useState("");
  const [mode, setMode] = useState("Injection sous-cutanée");
  const [renouvellement, setRenouvellement] = useState(false);
  const [renouvellements, setRenouvellements] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frequence =
    medicament.includes("oral") || mode.includes("oral")
      ? "Selon prescription"
      : "1 injection par semaine";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/medecin/ordonnance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dossierId,
        medicament,
        dosage,
        frequence,
        duree,
        instructions: instructions || "Suivre les directives du fabricant.",
        modeAdministration: mode,
        renouvellementAutorise: renouvellement,
        nombreRenouvellements: renouvellements,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Création impossible");
      setSaving(false);
      return;
    }
    const data = (await res.json()) as { prescription: { id: string } };
    onCreated(data.prescription.id);
    setSaving(false);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p>
          <strong>Médecin :</strong> Dr. {medecinName}
          {license ? ` · Permis ${license}` : ""}
        </p>
        <p>
          <strong>Patient :</strong> {patientName}
        </p>
        <p>
          <strong>Date :</strong> {new Date().toLocaleDateString("fr-CA")}
        </p>
      </section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Vérifiez les contre-indications et interactions à partir du dossier complet avant de
        signer. Aucune suggestion automatique ne remplace votre jugement.
      </div>

      <label className="block text-sm font-medium">
        Médicament
        <select
          value={medicament}
          onChange={(e) => setMedicament(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          {MEDICAMENTS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Dosage initial
        <select
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          {DOSAGES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Mode d&apos;administration
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          <option>Injection sous-cutanée</option>
          <option>Comprimé oral</option>
        </select>
      </label>

      <label className="block text-sm font-medium">
        Durée
        <select
          value={duree}
          onChange={(e) => setDuree(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        >
          {DUREES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Instructions spéciales
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={renouvellement}
          onChange={(e) => setRenouvellement(e.target.checked)}
        />
        Renouvellement autorisé
      </label>
      {renouvellement ? (
        <label className="block text-sm">
          Nombre de renouvellements (0–3)
          <input
            type="number"
            min={0}
            max={3}
            value={renouvellements}
            onChange={(e) => setRenouvellements(Number(e.target.value))}
            className="mt-1 w-24 rounded-lg border border-slate-200 px-2 py-1"
          />
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Création…" : "Enregistrer le brouillon d'ordonnance"}
      </button>
    </form>
  );
}
