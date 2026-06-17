"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  AdminIpsPractitioner,
  AdminIpsQueueItem,
  AdminIpsStats,
} from "@/app/api/admin/ips/route";
import {
  formatHoursAgo,
  statusColorClass,
  statusLabel,
} from "@/lib/ips/queue-utils";

export function AdminIpsPanel() {
  const [stats, setStats] = useState<AdminIpsStats | null>(null);
  const [practitioners, setPractitioners] = useState<AdminIpsPractitioner[]>([]);
  const [queue, setQueue] = useState<AdminIpsQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ips");
    if (res.ok) {
      const data = (await res.json()) as {
        stats: AdminIpsStats;
        practitioners: AdminIpsPractitioner[];
        queue: AdminIpsQueueItem[];
      };
      setStats(data.stats);
      setPractitioners(data.practitioners);
      setQueue(data.queue);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="IPS actives" value={stats.practitioners} />
          <Stat label="Soumis" value={stats.pending} accent="amber" />
          <Stat label="En révision" value={stats.underReview} accent="blue" />
          <Stat label="Non assignés" value={stats.unassigned} accent="red" />
          <Stat label="Approuvés" value={stats.approved} accent="green" />
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Infirmières praticiennes (IPS)</h2>
          <Link
            href="/admin/equipe"
            className="text-sm font-medium text-[#16a34a] hover:underline"
          >
            Gérer l&apos;équipe →
          </Link>
        </div>
        {practitioners.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune IPS enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2 pr-4">Nom</th>
                  <th className="pb-2 pr-4">Licence</th>
                  <th className="pb-2 pr-4">Courriel</th>
                  <th className="pb-2 pr-4 text-right">En attente</th>
                  <th className="pb-2 text-right">Dossiers</th>
                </tr>
              </thead>
              <tbody>
                {practitioners.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{p.name}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{p.license ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{p.email}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-amber-700">
                      {p.pendingCount}
                    </td>
                    <td className="py-2.5 text-right text-slate-600">{p.assignedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">File des dossiers IPS</h2>
        <p className="mt-1 text-sm text-slate-500">
          Questionnaires médicaux soumis — supervision admin.
        </p>
        {queue.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucun dossier pour l&apos;instant.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {queue.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {q.patientName}
                    {q.isUrgent ? (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Urgent
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    IMC {q.bmi.toFixed(1)} · IPS : {q.ipsName ?? "Non assignée"} ·{" "}
                    {formatHoursAgo(q.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorClass(q.status)}`}
                  >
                    {statusLabel(q.status)}
                  </span>
                  <Link
                    href={`/dashboard/ips/questionnaires/${q.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Ouvrir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "blue" | "red" | "green";
}) {
  const colors = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    red: "border-red-200 bg-red-50 text-red-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    default: "border-slate-200 bg-white text-slate-900",
  };
  const tone = accent ? colors[accent] : colors.default;
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
