"use client";

import type { WeightCheckInPublic } from "@/lib/patient/weight-program";
import { POIDS_BRAND } from "@/lib/patient/poids-design";

type Props = {
  checkIns: WeightCheckInPublic[];
  targetWeight?: number;
  startWeight?: number;
  className?: string;
};

function smoothLinePath(coords: { x: number; y: number }[]): string {
  if (coords.length < 2) return "";
  if (coords.length === 2) {
    const [a, b] = coords;
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  let d = `M ${coords[0]!.x} ${coords[0]!.y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)]!;
    const p1 = coords[i]!;
    const p2 = coords[i + 1]!;
    const p3 = coords[Math.min(coords.length - 1, i + 2)]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function WeightProgressChart({
  checkIns,
  targetWeight,
  startWeight,
  className = "",
}: Props) {
  const points = [...checkIns]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-14);

  if (points.length < 2) {
    return (
      <div
        className={`flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-[#FAFAF8] text-sm text-slate-500 ${className}`}
      >
        Enregistrez au moins 2 check-ins pour voir la courbe de poids.
      </div>
    );
  }

  const weights = points.map((p) => p.weight);
  const allValues = [
    ...weights,
    ...(targetWeight != null ? [targetWeight] : []),
    ...(startWeight != null ? [startWeight] : []),
  ];
  const minW = Math.min(...allValues) - 1;
  const maxW = Math.max(...allValues) + 1;
  const range = maxW - minW || 1;

  const w = 320;
  const h = 140;
  const padX = 8;
  const padY = 12;

  const yForWeight = (weight: number) => padY + (1 - (weight - minW) / range) * (h - padY * 2);

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2);
    const y = yForWeight(p.weight);
    return { x, y, ...p };
  });

  const linePath = smoothLinePath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1]!.x} ${h} L ${coords[0]!.x} ${h} Z`;

  const latest = coords[coords.length - 1]!;
  const first = coords[0]!;
  const delta = latest.weight - first.weight;

  const guideWeights = [maxW, (maxW + minW) / 2, minW];

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{latest.weight.toFixed(1)} kg</span>
          {" · "}
          {delta <= 0 ? (
            <span style={{ color: POIDS_BRAND.primary }}>{delta.toFixed(1)} kg sur la période</span>
          ) : (
            <span className="text-amber-700">+{delta.toFixed(1)} kg sur la période</span>
          )}
        </p>
        {targetWeight != null ? (
          <p className="text-xs text-slate-500">Objectif {targetWeight.toFixed(1)} kg</p>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-40 w-full rounded-xl bg-[#FAFAF8] ring-1 ring-slate-200/80"
        role="img"
        aria-label="Courbe d'évolution du poids"
      >
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={POIDS_BRAND.primary} />
            <stop offset="100%" stopColor={POIDS_BRAND.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {guideWeights.map((gw) => (
          <line
            key={gw}
            x1={padX}
            x2={w - padX}
            y1={yForWeight(gw)}
            y2={yForWeight(gw)}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        ))}

        {targetWeight != null ? (
          <line
            x1={padX}
            x2={w - padX}
            y1={yForWeight(targetWeight)}
            y2={yForWeight(targetWeight)}
            stroke={POIDS_BRAND.primary}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.45"
          />
        ) : null}

        <path d={areaPath} fill="url(#weightGrad)" opacity="0.25" />
        <path
          d={linePath}
          fill="none"
          stroke={POIDS_BRAND.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c) => (
          <circle
            key={c.id}
            cx={c.x}
            cy={c.y}
            r="4"
            fill="#fff"
            stroke={POIDS_BRAND.primary}
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>
          {new Date(first.recordedAt).toLocaleDateString("fr-CA", { month: "short", day: "numeric" })}
        </span>
        <span>
          {new Date(latest.recordedAt).toLocaleDateString("fr-CA", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
