"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/admin/EligibilityBadge";

type PatientRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  bmi: number | null;
  eligibility: EligibilityStatus;
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "ELIGIBLE", label: "Éligible" },
  { value: "NOT_ELIGIBLE", label: "Non éligible" },
  { value: "MEDICAL_REVIEW_REQUIRED", label: "Revue médicale" },
  { value: "PENDING", label: "En attente" },
];

const DATE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
];

type Props = {
  initialQueue?: string;
};

export function PatientTable({ initialQueue }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [queue] = useState(initialQueue ?? "");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (dateFilter) params.set("dateFilter", dateFilter);
    if (queue) params.set("queue", queue);

    const res = await fetch(`/api/admin/patients?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as {
        patients: PatientRow[];
        total: number;
      };
      setRows(data.patients);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, status, dateFilter, queue, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          placeholder="Rechercher nom ou courriel…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-1"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => {
            setPage(1);
            setDateFilter(e.target.value);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-2 text-xs text-slate-500">{total} patient(s)</p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Inscription</th>
              <th className="px-4 py-3">IMC</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucun patient
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString("fr-CA")}
                  </td>
                  <td className="px-4 py-3">{p.bmi?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <EligibilityBadge status={p.eligibility} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="font-medium text-[#16a34a] hover:underline"
                    >
                      Voir le dossier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-slate-600">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      ) : null}
    </div>
  );
}
