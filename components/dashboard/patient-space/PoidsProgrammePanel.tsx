"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { poidsBtnPrimary, poidsCard, poidsInput, poidsLink, poidsMeta, poidsTitle } from "@/lib/patient/poids-design";
import { poidsTabHref } from "@/lib/patient/dashboard-routes";
import type { WeightProgramPublic } from "@/lib/patient/weight-program";

type Props = {
  program: WeightProgramPublic | null;
  loading: boolean;
  onProgramChange: (program: WeightProgramPublic | null) => void;
  onCheckInComplete?: () => void;
};

export function PoidsProgrammePanel({
  program,
  loading,
  onProgramChange,
  onCheckInComplete,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [checkIn, setCheckIn] = useState({ weight: "", energie: "", sommeil: "", notes: "" });
  const [setup, setSetup] = useState({ startWeight: "", targetWeight: "" });

  async function createProgram(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/patient/weight-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startWeight: Number(setup.startWeight),
        targetWeight: Number(setup.targetWeight),
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { program: WeightProgramPublic };
      onProgramChange(data.program);
    }
    setSaving(false);
  }

  async function submitCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn.weight) return;
    setSaving(true);
    const res = await fetch("/api/patient/weight-program/check-ins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: Number(checkIn.weight),
        ...(checkIn.energie ? { energie: Number(checkIn.energie) } : {}),
        ...(checkIn.sommeil ? { sommeil: Number(checkIn.sommeil) } : {}),
        ...(checkIn.notes.trim() ? { notes: checkIn.notes.trim() } : {}),
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { program: WeightProgramPublic };
      onProgramChange(data.program);
      setCheckIn({ weight: "", energie: "", sommeil: "", notes: "" });
      onCheckInComplete?.();
    }
    setSaving(false);
  }

  if (loading) {
    return <DashboardSpinner />;
  }

  if (!program) {
    return (
      <form onSubmit={createProgram} className={poidsCard}>
        <h2 className={poidsTitle}>Créer mon programme</h2>
        <p className={`mt-2 ${poidsMeta}`}>
          Ces données alimentent votre tableau de bord et Anne, votre coach santé.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-700">
            <span>Poids de départ (kg)</span>
            <input
              type="number"
              step="0.1"
              required
              value={setup.startWeight}
              onChange={(e) => setSetup((s) => ({ ...s, startWeight: e.target.value }))}
              className={poidsInput}
            />
          </label>
          <label className="block text-sm text-slate-700">
            <span>Objectif (kg)</span>
            <input
              type="number"
              step="0.1"
              required
              value={setup.targetWeight}
              onChange={(e) => setSetup((s) => ({ ...s, targetWeight: e.target.value }))}
              className={poidsInput}
            />
          </label>
        </div>
        <button type="submit" disabled={saving} className={`mt-6 h-11 w-full ${poidsBtnPrimary}`}>
          {saving ? "Création…" : "Démarrer le programme"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <section className={poidsCard}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold text-slate-900">
              {program.currentWeight.toFixed(1)}{" "}
              <span className="text-xl text-slate-500">kg</span>
            </p>
            <p className={`mt-1 ${poidsMeta}`}>
              Départ {program.startWeight.toFixed(1)} kg → objectif{" "}
              {program.targetWeight.toFixed(1)} kg
            </p>
          </div>
          <p className="text-3xl font-bold text-[#1D4D3A]">{program.progressPct}%</p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#1D4D3A] transition-all"
            style={{ width: `${program.progressPct}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={poidsTabHref("progression")} className={poidsLink}>
            Voir ma progression →
          </Link>
          <Link href={poidsTabHref("coach")} className="font-semibold text-slate-600 hover:text-[#1D4D3A] hover:underline">
            Parler à Anne →
          </Link>
        </div>
      </section>

      <form onSubmit={submitCheckIn} className={poidsCard}>
        <h2 className={poidsTitle}>Nouveau check-in</h2>
        <p className={`mt-1 ${poidsMeta}`}>
          Anne vous enverra un message personnalisé après chaque pesée.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-700 sm:col-span-2">
            <span>Poids (kg) *</span>
            <input
              type="number"
              step="0.1"
              required
              value={checkIn.weight}
              onChange={(e) => setCheckIn((c) => ({ ...c, weight: e.target.value }))}
              className={poidsInput}
            />
          </label>
          <label className="block text-sm text-slate-700">
            <span>Énergie (1–5)</span>
            <input
              type="number"
              min={1}
              max={5}
              value={checkIn.energie}
              onChange={(e) => setCheckIn((c) => ({ ...c, energie: e.target.value }))}
              className={poidsInput}
            />
          </label>
          <label className="block text-sm text-slate-700">
            <span>Sommeil (heures)</span>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={checkIn.sommeil}
              onChange={(e) => setCheckIn((c) => ({ ...c, sommeil: e.target.value }))}
              className={poidsInput}
            />
          </label>
          <label className="block text-sm text-slate-700 sm:col-span-2">
            <span>Notes (optionnel)</span>
            <textarea
              rows={2}
              value={checkIn.notes}
              onChange={(e) => setCheckIn((c) => ({ ...c, notes: e.target.value }))}
              className={poidsInput}
            />
          </label>
        </div>
        <button type="submit" disabled={saving} className={`mt-4 h-10 ${poidsBtnPrimary}`}>
          {saving ? "Enregistrement…" : "Enregistrer le check-in"}
        </button>
      </form>
    </div>
  );
}
