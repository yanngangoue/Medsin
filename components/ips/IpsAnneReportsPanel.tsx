"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnneReportPublic } from "@/app/api/ips/anne-reports/route";

type Props = {
  patients: { id: string; name: string }[];
};

function kindLabel(kind: AnneReportPublic["kind"]): string {
  return kind === "WEEKLY" ? "Hebdomadaire" : "Check-in";
}

export function IpsAnneReportsPanel({ patients }: Props) {
  const [reports, setReports] = useState<AnneReportPublic[]>([]);
  const [patientFilter, setPatientFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (patientId?: string) => {
    setLoading(true);
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";
    const res = await fetch(`/api/ips/anne-reports${qs}`);
    if (res.ok) {
      const data = (await res.json()) as { reports: AnneReportPublic[] };
      setReports(data.reports);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(patientFilter || undefined);
  }, [load, patientFilter]);

  const sorted = useMemo(
    () => [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports],
  );

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patients.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="patient-filter" className="text-sm font-medium text-slate-700">
            Filtrer par patient
          </label>
          <select
            id="patient-filter"
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#3EBD93]"
          >
            <option value="">Tous les patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aucun rapport Anne pour le moment. Les rapports apparaîtront après les check-ins et
          chaque vendredi à 8 h.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((r) => {
            const open = expandedId === r.id;
            return (
              <li
                key={r.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  r.isEscalation
                    ? "border-red-200 ring-1 ring-red-100"
                    : "border-[#3EBD93]/25"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : r.id)}
                  className="flex w-full items-start gap-3 p-5 text-left hover:bg-slate-50/80"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3EBD93] text-sm font-bold text-white">
                    A
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{r.patientName}</p>
                      {r.isEscalation ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                          Urgent
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {kindLabel(r.kind)}
                        {r.weekNumber ? ` · Sem. ${r.weekNumber}` : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString("fr-CA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {!open ? (
                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">
                        {r.content}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-slate-400">{open ? "▲" : "▼"}</span>
                </button>
                {open ? (
                  <div className="border-t border-slate-100 bg-[#F7F9F8] px-5 py-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                      {r.content}
                    </pre>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
