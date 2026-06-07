"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";
import type { WeightProgramPublic } from "@/lib/patient/weight-program";

export function PatientWeightProgramCard() {
  const [program, setProgram] = useState<WeightProgramPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/patient/weight-program");
      if (!cancelled && res.ok) {
        const data = (await res.json()) as { program?: WeightProgramPublic | null };
        setProgram(data.program ?? null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[#1D4D3A]/15 bg-gradient-to-br from-[#E8F0EC] to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1D4D3A]">
            Programme poids
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Votre progression</h2>
        </div>
        <Link
          href={PATIENT_DASHBOARD_ROUTES.poids}
          className="text-sm font-semibold text-[#1D4D3A] hover:underline"
        >
          Voir le suivi →
        </Link>
      </div>

      {loading ? (
        <div className="mt-4">
          <DashboardSpinner label="Chargement du programme…" />
        </div>
      ) : !program ? (
        <div className="mt-4">
          <p className="text-sm text-slate-700">
            Démarrez votre programme de gestion du poids avec suivi et Anne, votre coach santé.
          </p>
          <Link
            href={PATIENT_DASHBOARD_ROUTES.poids}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#1D4D3A] px-5 text-sm font-semibold text-white hover:bg-[#163d2f]"
          >
            Configurer mon programme
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {program.currentWeight.toFixed(1)}{" "}
                <span className="text-lg font-medium text-slate-500">kg</span>
              </p>
              <p className="text-sm text-slate-700">
                Objectif {program.targetWeight.toFixed(1)} kg ·{" "}
                <span className="font-medium text-[#1D4D3A]">
                  −{program.weightLost.toFixed(1)} kg
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1D4D3A]">{program.progressPct}%</p>
              <p className="text-xs text-slate-500">vers l&apos;objectif</p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#1D4D3A] transition-all"
              style={{ width: `${program.progressPct}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
