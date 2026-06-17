"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatHoursAgo,
  matchesQueueFilter,
  patientDisplayName,
  patientInitials,
  statusColorClass,
  statusLabel,
  type QueueFilter,
  type QueueQuestionnaire,
} from "@/lib/ips/queue-utils";
import { FetchErrorAlert } from "@/components/ui/FetchErrorAlert";
import { FETCH_ERROR_FALLBACK, userFacingErrorMessage } from "@/lib/client/fetch-json";

type DashboardData = {
  practitionerName: string;
  stats: {
    queuePending: number;
    anneReportsUnread: number;
    unreadChat: number;
  };
  questionnaires: QueueQuestionnaire[];
};

const FILTERS: { id: QueueFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "urgent", label: "Urgent" },
  { id: "pending", label: "En attente" },
  { id: "approved", label: "Approuvés" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function IpsQueueDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<QueueFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/ips/dashboard");
      const body = (await res.json().catch(() => ({}))) as DashboardData & { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? FETCH_ERROR_FALLBACK);
      }
      setData(body);
    } catch (err) {
      console.error("[IpsQueueDashboard] load", err);
      setLoadError(userFacingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.questionnaires.filter((q) => matchesQueueFilter(q, filter));
  }, [data, filter]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {loadError ? (
        <FetchErrorAlert message={loadError} onRetry={() => void load()} />
      ) : null}

      {loading ? (
        <>
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </>
      ) : (
        <>
          <header>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Bonjour, {data?.practitionerName ?? "…"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {data?.stats.queuePending ?? 0} dossier
                {(data?.stats.queuePending ?? 0) > 1 ? "s" : ""} en attente
              </span>
              <span className="text-slate-400"> · </span>
              <span>
                {(data?.stats.anneReportsUnread ?? 0) === 0
                  ? "Aucun rapport Anne non lu"
                  : `${data?.stats.anneReportsUnread} rapport${(data?.stats.anneReportsUnread ?? 0) > 1 ? "s" : ""} Anne non lu${(data?.stats.anneReportsUnread ?? 0) > 1 ? "s" : ""}`}
              </span>
            </p>
          </header>

          <div
            className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
            role="tablist"
            aria-label="Filtrer les dossiers"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  filter === f.id
                    ? "bg-[#1D4D3A] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
                {f.id === "urgent"
                  ? ` (${data?.questionnaires.filter((q) => q.isUrgent).length ?? 0})`
                  : null}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Aucun dossier pour ce filtre.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((q) => (
                <li key={q.id}>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#3EBD93]/50 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]/10 text-sm font-bold text-[#1D4D3A]"
                          aria-hidden
                        >
                          {patientInitials(q.patientPrenom, q.patientNom)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {patientDisplayName(q.patientPrenom, q.patientNom)}
                            {q.age != null ? (
                              <span className="font-normal text-slate-500"> · {q.age} ans</span>
                            ) : null}
                            <span className="font-normal text-slate-500">
                              {" "}
                              · IMC {q.bmi.toFixed(1)}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Reçu il y a {formatHoursAgo(q.createdAt)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {q.medicationRequested ? (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                {q.medicationRequested}
                              </span>
                            ) : null}
                            {q.isUrgent ? (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                Urgent
                                {q.urgentReasons[0] ? ` — ${q.urgentReasons[0]}` : ""}
                              </span>
                            ) : null}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColorClass(q.status)}`}
                            >
                              {statusLabel(q.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/ips/questionnaires/${q.id}`}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#3EBD93] px-5 text-sm font-bold text-white hover:bg-[#35a882]"
                      >
                        Réviser le dossier →
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
