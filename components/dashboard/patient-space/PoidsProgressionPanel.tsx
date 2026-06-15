"use client";

import Link from "next/link";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { WeightProgressChartLazy } from "@/components/dashboard/patient-space/WeightProgressChartLazy";
import { WeightProgramStats } from "@/components/dashboard/patient-space/WeightProgramStats";
import { poidsBtnPrimary, poidsCard, poidsMeta, poidsTitle } from "@/lib/patient/poids-design";
import { poidsTabHref } from "@/lib/patient/dashboard-routes";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";

type Props = {
  program: WeightProgramPublic | null;
  checkIns: WeightCheckInPublic[];
  loading: boolean;
};

export function PoidsProgressionPanel({ program, checkIns, loading }: Props) {
  if (loading) {
    return <DashboardSpinner />;
  }

  if (!program) {
    return (
      <div className={`${poidsCard} text-center`}>
        <p className={poidsMeta}>Créez d&apos;abord votre programme pour suivre votre progression.</p>
        <Link href={poidsTabHref("programme")} className={`mt-6 h-11 ${poidsBtnPrimary}`}>
          Démarrer mon programme
        </Link>
      </div>
    );
  }

  const displayCheckIns = checkIns.length > 0 ? checkIns : (program.recentCheckIns ?? []);

  return (
    <div className="space-y-6">
      <WeightProgramStats program={program} checkIns={displayCheckIns} />

      <section className={poidsCard}>
        <h2 className={poidsTitle}>Courbe de poids</h2>
        <div className="mt-4 min-w-0">
          <WeightProgressChartLazy
            checkIns={displayCheckIns}
            startWeight={program.startWeight}
            targetWeight={program.targetWeight}
          />
        </div>
      </section>

      <section className={poidsCard}>
        <h2 className={poidsTitle}>Historique des bilans hebdomadaires</h2>
        {displayCheckIns.length === 0 ? (
          <p className={`mt-4 ${poidsMeta}`}>Aucun bilan hebdomadaire pour le moment.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {displayCheckIns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {new Date(c.recordedAt).toLocaleDateString("fr-CA", { dateStyle: "full" })}
                  </p>
                  {(c.energie != null || c.sommeil != null || c.notes) && (
                    <p className={`mt-1 text-xs ${poidsMeta}`}>
                      {c.energie != null ? `Énergie ${c.energie}/5` : null}
                      {c.energie != null && c.sommeil != null ? " · " : null}
                      {c.sommeil != null ? `Sommeil ${c.sommeil} h` : null}
                      {c.notes ? ` — ${c.notes}` : null}
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900">{c.weight.toFixed(1)} kg</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
