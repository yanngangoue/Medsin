"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightCheckInPublic } from "@/lib/patient/weight-program";
import { POIDS_BRAND } from "@/lib/patient/poids-design";
import { formatDeltaKg } from "@/lib/weight-tracking";

type Props = {
  checkIns: WeightCheckInPublic[];
  targetWeight?: number;
  startWeight?: number;
  className?: string;
};

type ChartPoint = {
  id: string;
  date: string;
  label: string;
  weight: number;
  delta: number | null;
  isLatest: boolean;
};

function buildChartData(checkIns: WeightCheckInPublic[]): ChartPoint[] {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  return sorted.map((c, i) => {
    const prev = i > 0 ? sorted[i - 1] : undefined;
    const delta =
      prev != null ? Math.round((c.weight - prev.weight) * 10) / 10 : null;
    return {
      id: c.id,
      date: c.recordedAt,
      label: new Date(c.recordedAt).toLocaleDateString("fr-CA", {
        month: "short",
        day: "numeric",
      }),
      weight: c.weight,
      delta,
      isLatest: i === sorted.length - 1,
    };
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{p.weight.toFixed(1)} kg</p>
      <p className="text-xs text-slate-500">
        {new Date(p.date).toLocaleDateString("fr-CA", { dateStyle: "medium" })}
      </p>
      {p.delta != null ? (
        <p
          className={`mt-1 text-xs font-medium ${
            p.delta <= 0 ? "text-emerald-600" : "text-amber-700"
          }`}
        >
          {formatDeltaKg(p.delta)} vs précédent
        </p>
      ) : null}
    </div>
  );
}

export function WeightProgressChart({
  checkIns,
  targetWeight,
  className = "",
}: Props) {
  const data = buildChartData(checkIns);

  if (data.length < 2) {
    return (
      <div
        className={`flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#3EBD93]/40 bg-[#F0F7F4] px-6 text-center ${className}`}
      >
        <p className="text-2xl" aria-hidden>
          📈
        </p>
        <p className="mt-2 text-sm font-medium text-[#1D4D3A]">
          Encore un bilan hebdomadaire et votre courbe apparaît !
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Anne analysera automatiquement votre progression dès le 2e enregistrement.
        </p>
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const yMin = Math.floor(Math.min(...weights, targetWeight ?? weights[0]!) - 2);
  const yMax = Math.ceil(Math.max(...weights, targetWeight ?? weights[0]!) + 2);

  return (
    <div className={`w-full min-w-0 ${className}`} style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v} kg`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          {targetWeight != null ? (
            <ReferenceLine
              y={targetWeight}
              stroke={POIDS_BRAND.primary}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              label={{
                value: `Objectif ${targetWeight.toFixed(1)} kg`,
                position: "insideTopRight",
                fill: POIDS_BRAND.primary,
                fontSize: 11,
              }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="weight"
            stroke={POIDS_BRAND.primary}
            strokeWidth={2.5}
            isAnimationActive={false}
            dot={{
              r: 4,
              fill: "#fff",
              stroke: POIDS_BRAND.primary,
              strokeWidth: 2,
            }}
            activeDot={{ r: 7, fill: POIDS_BRAND.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
