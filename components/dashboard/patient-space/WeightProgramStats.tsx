import { tendancePoids } from "@/lib/coach-weight-trends";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";

type Props = {
  program: WeightProgramPublic;
  checkIns: WeightCheckInPublic[];
};

export function WeightProgramStats({ program, checkIns }: Props) {
  const tendance = tendancePoids(checkIns);

  const stats = [
    {
      label: "Poids actuel",
      value: `${program.currentWeight.toFixed(1)} kg`,
      hint: `Objectif ${program.targetWeight.toFixed(1)} kg`,
    },
    {
      label: "Perdu depuis le départ",
      value: `${program.weightLost.toFixed(1)} kg`,
      hint: `${program.progressPct}% de l'objectif`,
    },
    {
      label: "Tendance récente",
      value:
        tendance.deltaDernierKg != null
          ? `${tendance.deltaDernierKg > 0 ? "+" : ""}${tendance.deltaDernierKg} kg`
          : "—",
      hint: tendance.libelle,
    },
    {
      label: "Énergie / sommeil",
      value:
        tendance.moyenneEnergie != null
          ? `${tendance.moyenneEnergie}/5`
          : tendance.moyenneSommeil != null
            ? `${tendance.moyenneSommeil} h`
            : "—",
      hint:
        tendance.moyenneSommeil != null && tendance.moyenneEnergie != null
          ? `Sommeil ~${tendance.moyenneSommeil} h`
          : "Moyennes sur les check-ins récents",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}
