"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AnneWeeklyStatus } from "@/app/api/patient/coach-ia/weekly-status/route";

export function AnneWeeklyStatusCard() {
  const [status, setStatus] = useState<AnneWeeklyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/coach-ia/weekly-status");
      const body = (await res.json().catch(() => ({}))) as AnneWeeklyStatus & { error?: string };
      if (!res.ok) {
        console.error("[AnneWeeklyStatusCard] load", body.error ?? res.status);
        return;
      }
      setStatus(body);
    } catch (err) {
      console.error("[AnneWeeklyStatusCard] load", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-[#3EBD93]/30 bg-[#F0F7F4] p-4">
        <div className="h-4 w-32 rounded bg-[#3EBD93]/20" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="rounded-xl border border-[#3EBD93]/40 bg-gradient-to-br from-[#E8F5EF] to-[#F0F7F4] p-4 shadow-sm">
      <p className="text-sm font-bold text-[#1D4D3A]">📋 Anne cette semaine</p>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <span className={status.mondayCheckInSent ? "text-emerald-600" : "text-slate-400"}>
            {status.mondayCheckInSent ? "✓" : "○"}
          </span>
          Bilan hebdomadaire {status.mondayCheckInSent ? "envoyé" : "prévu"} lundi
        </li>
        <li className="flex items-center gap-2">
          <span className={status.fridayReportSent ? "text-emerald-600" : "text-slate-400"}>
            {status.fridayReportSent ? "✓" : "○"}
          </span>
          Rapport IPS {status.fridayReportSent ? "envoyé" : "prévu"} vendredi
        </li>
        <li className="flex items-center gap-2 text-slate-600">
          <span>⏳</span>
          Prochain rappel : lundi {status.nextReminderLabel}
        </li>
      </ul>
      {status.reportCount > 0 ? (
        <Link
          href="/dashboard/patient/coach-ia/rapports"
          className="mt-4 block w-full rounded-lg border border-[#3EBD93]/50 bg-white py-2 text-center text-xs font-semibold text-[#1D4D3A] transition hover:bg-[#F0F7F4]"
        >
          Voir l&apos;historique des rapports ({status.reportCount})
        </Link>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Vos rapports IPS apparaîtront après vos premiers bilans hebdomadaires.
        </p>
      )}
    </div>
  );
}
