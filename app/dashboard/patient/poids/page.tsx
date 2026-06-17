"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnneCoachCheckInModal } from "@/components/dashboard/patient-space/AnneCoachCheckInModal";
import { WeightProgressChartLazy } from "@/components/dashboard/patient-space/WeightProgressChartLazy";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { FetchErrorAlert } from "@/components/ui/FetchErrorAlert";
import { FETCH_ERROR_FALLBACK, userFacingErrorMessage } from "@/lib/client/fetch-json";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";
const poidsCard = "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm";
const poidsBtnPrimary = "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50";
const poidsMeta = "text-sm text-slate-500";
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
  const trendColor = stats.weekDeltaKg != null && stats.weekDeltaKg <= 0 ? "#10B981" : stats.weekDeltaKg != null && stats.weekDeltaKg > 0 ? "#F59E0B" : "#94A3B8";
  const trendArrow = stats.weekDeltaKg != null && stats.weekDeltaKg <= 0 ? "↓" : stats.weekDeltaKg != null && stats.weekDeltaKg > 0 ? "↑" : "→";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Poids actuel */}
      <div className="dash-enter rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Poids actuel</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0F7F4]">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><circle cx="10" cy="10" r="7" stroke="#1D4D3A" strokeWidth="1.5"/><path d="M10 7v3l2 2" stroke="#1D4D3A" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
        </div>
        <p className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900">
          {program.currentWeight.toFixed(1)}<span className="text-xl font-semibold text-slate-400"> kg</span>
        </p>
        <p className={`mt-2 text-sm font-semibold ${stats.isProgressing ? "text-emerald-600" : "text-slate-600"}`}>
          {stats.isProgressing ? "↓" : ""} {stats.totalLostKg.toFixed(1)} kg perdus au total
        </p>
        <p className="mt-0.5 text-xs text-slate-400">Départ : {program.startWeight.toFixed(1)} kg</p>
      </div>

      {/* Objectif */}
      <div className="dash-enter rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Objectif</p>
          <span className="rounded-full bg-[#F0F7F4] px-2 py-0.5 text-[11px] font-bold text-[#1D4D3A]">{stats.progressPct}%</span>
        </div>
        <p className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900">
          {program.targetWeight.toFixed(1)}<span className="text-xl font-semibold text-slate-400"> kg</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="dash-progress-bar h-full rounded-full bg-gradient-to-r from-[#3EBD93] to-[#1D4D3A]" style={{ width: `${Math.min(100, stats.progressPct)}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{stats.remainingKg.toFixed(1)} kg restants</p>
      </div>

      {/* Tendance */}
      <div className="dash-enter rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" style={{ animationDelay: "120ms" }}>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tendance</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-4xl font-bold" style={{ color: trendColor }}>{trendArrow}</span>
          <p className="mb-1 font-display text-xl font-bold text-slate-900">{formatDeltaKg(stats.weekDeltaKg)}</p>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">cette semaine</p>
        <p className="mt-0.5 text-xs text-slate-400">{formatDeltaKg(stats.monthDeltaKg)} ce mois</p>
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
        Aucun bilan hebdomadaire pour le moment. Commencez dès aujourd&apos;hui !
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [program, setProgram] = useState<WeightProgramPublic | null>(null);
  const [checkIns, setCheckIns] = useState<WeightCheckInPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [progRes, checkRes] = await Promise.all([
        fetch("/api/patient/weight-program"),
        fetch("/api/patient/weight-program/check-ins"),
      ]);
      const progBody = (await progRes.json().catch(() => ({}))) as {
        program?: WeightProgramPublic | null;
        error?: string;
      };
      const checkBody = (await checkRes.json().catch(() => ({}))) as {
        checkIns?: WeightCheckInPublic[];
        error?: string;
      };
      if (!progRes.ok) {
        throw new Error(progBody.error ?? FETCH_ERROR_FALLBACK);
      }
      if (!checkRes.ok) {
        throw new Error(checkBody.error ?? FETCH_ERROR_FALLBACK);
      }
      setProgram(progBody.program ?? null);
      setCheckIns(checkBody.checkIns ?? []);
    } catch (err) {
      console.error("[PoidsSuiviContent] loadData", err);
      setLoadError(userFacingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (tab === "coach") {
      router.replace("/dashboard/patient/coach-ia");
      return;
    }
    if (tab === "progression" && !loading) {
      document.getElementById("evolution-poids")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tab, loading, router]);

  const displayCheckIns = checkIns.length > 0 ? checkIns : (program?.recentCheckIns ?? []);
  const stats = program ? computeWeightTrackingStats(program, displayCheckIns) : null;
  const checkInPending = program ? isCheckInPendingThisWeek(displayCheckIns) : false;

  function handleCheckInSuccess(
    _coachMessage: unknown,
    updatedProgram: WeightProgramPublic | null,
  ) {
    if (updatedProgram) setProgram(updatedProgram);
    void loadData();
    setToast("Anne a analysé votre bilan hebdomadaire ✓");
    window.dispatchEvent(new CustomEvent("medsim:check-in-complete"));
  }

  if (loading) {
    return <DashboardSpinner />;
  }

  if (loadError) {
    return (
      <div className={poidsCard}>
        <FetchErrorAlert message={loadError} onRetry={() => void loadData()} />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <span className="text-4xl">⚖️</span>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Votre programme de suivi n&apos;est pas encore activé. Une fois votre parcours GLP-1
          démarré, vous pourrez enregistrer vos bilans hebdomadaires ici.
        </p>
        <Link
          href={PATIENT_DASHBOARD_ROUTES.hub}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          Retour à mon espace
        </Link>
      </div>
    );
  }

  return (
    <>
      {checkInPending ? (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">⚖️</span>
          <div>
            <p className="font-semibold text-amber-900">Bilan hebdomadaire en attente</p>
            <p className="mt-0.5 text-sm text-amber-800">Anne vous attend pour votre pesée de la semaine.</p>
          </div>
          <button
            type="button"
            onClick={() => setCheckInOpen(true)}
            className="ml-auto shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
          >
            Faire mon bilan
          </button>
        </div>
      ) : null}

      {stats ? <QuickStatsGrid program={program} stats={stats} /> : null}

      <section id="evolution-poids" className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-slate-900">Évolution du poids</h2>
        <div className="mt-4 min-w-0">
          <WeightProgressChartLazy
            checkIns={displayCheckIns}
            startWeight={program.startWeight}
            targetWeight={program.targetWeight}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-slate-900">Historique des bilans</h2>
          <button
            type="button"
            onClick={() => setCheckInOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-4 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            + Nouveau bilan
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
      description="Bilans hebdomadaires, courbe de progression et rapports automatiques pour votre IPS via Anne."
      maxWidth="4xl"
    >
      <Suspense fallback={<DashboardSpinner />}>
        <PoidsSuiviContent />
      </Suspense>
    </PatientDashboardPageShell>
  );
}
