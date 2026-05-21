"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EligibilityStatus } from "@prisma/client";
import { EligibilityBadge } from "@/components/EligibilityBadge";

type PatientRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  imc: number | null;
  eligibility: EligibilityStatus;
  hasGlp1Dossier: boolean;
  glp1SubmittedAt: string | null;
  age: number | null;
  weightKg: number | null;
};

type FilterKey = "status" | "queue" | "glp1";

const STATUS_FILTERS: { value: string; label: string; kind: FilterKey }[] = [
  { value: "", label: "Tous", kind: "status" },
  { value: "a_revoir", label: "À revoir (GLP-1)", kind: "queue" },
  { value: "MEDICAL_REVIEW_REQUIRED", label: "Revue médicale", kind: "status" },
  { value: "ELIGIBLE", label: "Éligible", kind: "status" },
  { value: "NOT_ELIGIBLE", label: "Non éligible", kind: "status" },
  { value: "PENDING", label: "En attente", kind: "status" },
  { value: "glp1", label: "Avec éval. GLP-1", kind: "glp1" },
];

type Props = {
  initialQueue?: string;
};

export function AdminPatientsTable({ initialQueue }: Props) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [queue, setQueue] = useState(searchParams.get("queue") ?? initialQueue ?? "");
  const [glp1Only, setGlp1Only] = useState(searchParams.get("glp1") === "1");
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeFilterKey = (): string => {
    if (queue === "a_revoir") return "a_revoir";
    if (glp1Only) return "glp1";
    return status;
  };

  const applyFilter = (f: (typeof STATUS_FILTERS)[number]) => {
    setQueue(f.kind === "queue" ? f.value : "");
    setStatus(f.kind === "status" ? f.value : "");
    setGlp1Only(f.kind === "glp1");
  };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (queue) params.set("queue", queue);
    else if (status) params.set("status", status);
    if (glp1Only) params.set("glp1", "1");
    const res = await fetch(`/api/admin/patients?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as { patients: PatientRow[]; total: number };
      setRows(data.patients);
      setTotal(data.total);
    }
    setLoading(false);
  }, [status, queue, glp1Only]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = activeFilterKey();

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">
        File d&apos;attente télésanté : ouvrez un dossier pour lire les réponses patient et prendre une
        décision (éligibilité, refus, revue).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => applyFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === f.value
                ? "bg-[#16a34a] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-slate-500">{total} patient(s)</p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Âge</th>
              <th className="px-4 py-3">IMC</th>
              <th className="px-4 py-3">GLP-1</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Aucun patient pour ce filtre
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.email}</td>
                  <td className="px-4 py-3">{p.age ?? "—"}</td>
                  <td className="px-4 py-3">{p.imc ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.hasGlp1Dossier ? (
                      <span className="text-xs font-medium text-emerald-700">Éval. reçue</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EligibilityBadge status={p.eligibility} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="font-medium text-[#16a34a] hover:underline"
                    >
                      Ouvrir dossier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
