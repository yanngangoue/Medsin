"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AnneCoachCheckInModal } from "@/components/dashboard/patient-space/AnneCoachCheckInModal";
import { WeightProgressChart } from "@/components/dashboard/patient-space/WeightProgressChart";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";
import { poidsBtnPrimary, poidsCard, poidsMeta } from "@/lib/patient/poids-design";
import {
  checkInDelta,
  computeWeightTrackingStats,
  energyLabel,
  formatDeltaKg,
  isCheckInPendingThisWeek,
  nauseeLabel,
} from "@/lib/weight-tracking";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";

function PoidsToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl border border-[#3EBD93]/40 bg-[#1D4D3A] px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
      {message}
    </div>
  );
}

function QuickStatsGrid({
  program,
  stats,
}: {
  program: WeightProgramPublic;
  stats: ReturnType<typeof computeWeightTrackingStats>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className={poidsCard}>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Poids actuel</p>
        <p className="mt-2 text-3xl font-black text-slate-900">
          {program.currentWeight.toFixed(1)}{" "}
          <span className="text-lg font-semibold text-slate-500">kg</span>
        </p>
        <p
          className={`mt-2 text-sm font-medium ${
            stats.isProgressing ? "text-emerald-600" : "text-slate-600"
          }`}
        >
          −{stats.totalLostKg.toFixed(1)} kg depuis le début
        </p>
        <p className={`mt-1 text-xs ${poidsMeta}`}>
          Départ : {program.startWeight.toFixed(1)} kg
        </p>
      </div>

      <div className={poidsCard}>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Objectif</p>
        <p className="mt-2 text-lg font-bold text-slate-900">
          {program.targetWeight.toFixed(1)} kg
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1D4D3A] transition-all"
            style={{ width: `${Math.min(100, stats.progressPct)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {stats.remainingKg.toFixed(1)} kg restants pour atteindre l&apos;objectif
        </p>
        <p className="mt-1 text-xs font-semibold text-[#1D4D3A]">{stats.progressPct}% complété</p>
      </div>

      <div className={poidsCard}>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tendance</p>
        <div className="mt-2 flex items-center gap-2">
          {stats.weekDeltaKg != null && stats.weekDeltaKg <= 0 ? (
            <span className="text-2xl text-emerald-600" aria-hidden>
              ↓
            </span>
          ) : stats.weekDeltaKg != null && stats.weekDeltaKg > 0 ? (
            <span className="text-2xl text-amber-600" aria-hidden>
              ↑
            </span>
          ) : (
            <span className="text-2xl text-slate-400" aria-hidden>
              →
            </span>
          )}
          <p className="text-lg font-bold text-slate-900">
            {formatDeltaKg(stats.weekDeltaKg)} cette semaine
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {formatDeltaKg(stats.monthDeltaKg)} ce mois
        </p>
      </div>
    </div>
  );
}

function CheckInHistoryTable({ checkIns }: { checkIns: WeightCheckInPublic[] }) {
  const sorted = useMemo(
    () =>
      [...checkIns].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      ),
    [checkIns],
  );

  if (sorted.length === 0) {
    return (
      <p className={`py-8 text-center ${poidsMeta}`}>
        Aucun check-in pour le moment. Commencez dès aujourd&apos;hui !
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 pr-4">Poids</th>
            <th className="pb-3 pr-4">Delta</th>
            <th className="pb-3 pr-4">Énergie</th>
            <th className="pb-3 pr-4">Sommeil</th>
            <th className="pb-3 pr-4">Nausées</th>
            <th className="pb-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const prev = sorted[i + 1];
            const delta = checkInDelta(c, prev);
            return (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3 pr-4 whitespace-nowrap text-slate-700">
                  {new Date(c.recordedAt).toLocaleDateString("fr-CA", { dateStyle: "medium" })}
                </td>
                <td className="py-3 pr-4 font-bold text-slate-900">{c.weight.toFixed(1)} kg</td>
                <td
                  className={`py-3 pr-4 font-medium ${
                    delta != null && delta <= 0 ? "text-emerald-600" : "text-slate-600"
                  }`}
                >
                  {formatDeltaKg(delta)}
                </td>
                <td className="py-3 pr-4 text-slate-700">{energyLabel(c.energie)}</td>
                <td className="py-3 pr-4 text-slate-700">
                  {c.sommeil != null ? `${c.sommeil} h` : "—"}
                </td>
                <td className="py-3 pr-4 text-slate-700">{nauseeLabel(c.nausee)}</td>
                <td className="py-3 max-w-[160px] truncate text-slate-500" title={c.notes ?? ""}>
                  {c.notes ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PoidsSuiviContent() {
  const [program, setProgram] = useState<WeightProgramPublic | null>(null);
  const [checkIns, setCheckIns] = useState<WeightCheckInPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [progRes, checkRes] = await Promise.all([
      fetch("/api/patient/weight-program"),
      fetch("/api/patient/weight-program/check-ins"),
    ]);
    if (progRes.ok) {
      const data = (await progRes.json()) as { program?: WeightProgramPublic | null };
      setProgram(data.program ?? null);
    }
    if (checkRes.ok) {
      const data = (await checkRes.json()) as { checkIns?: WeightCheckInPublic[] };
      setCheckIns(data.checkIns ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const displayCheckIns = checkIns.length > 0 ? checkIns : (program?.recentCheckIns ?? []);
  const stats = program ? computeWeightTrackingStats(program, displayCheckIns) : null;
  const checkInPending = program ? isCheckInPendingThisWeek(displayCheckIns) : false;

  function handleCheckInSuccess(
    _coachMessage: unknown,
    updatedProgram: WeightProgramPublic | null,
  ) {
    if (updatedProgram) setProgram(updatedProgram);
    void loadData();
    setToast("Anne a analysé votre check-in ✓");
    window.dispatchEvent(new CustomEvent("medsim:check-in-complete"));
  }

  if (loading) {
    return <DashboardSpinner />;
  }

  if (!program) {
    return (
      <div className={`${poidsCard} text-center`}>
        <p className={poidsMeta}>
          Votre programme de suivi n&apos;est pas encore activé. Une fois votre parcours GLP-1
          démarré, vous pourrez enregistrer vos check-ins hebdomadaires ici.
        </p>
        <Link href={PATIENT_DASHBOARD_ROUTES.hub} className={`mt-6 h-11 ${poidsBtnPrimary}`}>
          Retour à mon espace
        </Link>
      </div>
    );
  }

  return (
    <>
      {checkInPending ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          ⚠️ Check-in en attente — Anne vous attend pour votre pesée hebdomadaire.
        </div>
      ) : null}

      {stats ? <QuickStatsGrid program={program} stats={stats} /> : null}

      <section className={poidsCard}>
        <h2 className="text-base font-semibold text-slate-900">Évolution du poids</h2>
        <div className="mt-4">
          <WeightProgressChart
            checkIns={displayCheckIns}
            startWeight={program.startWeight}
            targetWeight={program.targetWeight}
          />
        </div>
      </section>

      <section className={poidsCard}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Historique des check-ins</h2>
          <button
            type="button"
            onClick={() => setCheckInOpen(true)}
            className={`h-10 shrink-0 px-4 ${poidsBtnPrimary}`}
          >
            Faire mon check-in
          </button>
        </div>
        <div className="mt-4">
          <CheckInHistoryTable checkIns={displayCheckIns} />
        </div>
      </section>

      <p className="text-center text-xs text-slate-500">
        Besoin de parler à Anne ?{" "}
        <Link href="/dashboard/patient/coach-ia" className="font-semibold text-[#1D4D3A] hover:underline">
          Ouvrir le clavardage
        </Link>
      </p>

      <AnneCoachCheckInModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        defaultWeight={program.currentWeight}
        onSubmitStart={() => setToast("Anne analyse vos données…")}
        onSuccess={handleCheckInSuccess}
      />

      <PoidsToast message={toast ?? ""} visible={Boolean(toast)} />
    </>
  );
}

export default function PatientPoidsPage() {
  return (
    <PatientDashboardPageShell
      eyebrow="Suivi poids MedSim"
      title="Mon suivi poids"
      description="Check-ins hebdomadaires, courbe de progression et rapports automatiques pour votre IPS via Anne."
      maxWidth="4xl"
    >
      <Suspense fallback={<DashboardSpinner />}>
        <PoidsSuiviContent />
      </Suspense>
    </PatientDashboardPageShell>
  );
}
