import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";
import { hasCheckInThisWeekQuebec, startOfWeekMondayQuebec } from "@/lib/anne/schedule";

export type WeightTrackingStats = {
  totalLostKg: number;
  remainingKg: number;
  progressPct: number;
  weekDeltaKg: number | null;
  monthDeltaKg: number | null;
  isProgressing: boolean;
};

function sortedAsc(checkIns: WeightCheckInPublic[]): WeightCheckInPublic[] {
  return [...checkIns].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
}

function deltaSince(cutoff: Date, sorted: WeightCheckInPublic[]): number | null {
  if (sorted.length < 2) return null;
  const inRange = sorted.filter((c) => new Date(c.recordedAt) >= cutoff);
  if (inRange.length >= 2) {
    return round1(inRange[inRange.length - 1]!.weight - inRange[0]!.weight);
  }
  const latest = sorted[sorted.length - 1]!;
  const before = [...sorted].reverse().find((c) => new Date(c.recordedAt) < cutoff);
  if (!before) return null;
  return round1(latest.weight - before.weight);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeWeightTrackingStats(
  program: WeightProgramPublic,
  checkIns: WeightCheckInPublic[],
): WeightTrackingStats {
  const sorted = sortedAsc(checkIns);
  const totalLostKg = round1(Math.max(0, program.startWeight - program.currentWeight));
  const remainingKg = round1(Math.max(0, program.currentWeight - program.targetWeight));

  const weekStart = startOfWeekMondayQuebec();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return {
    totalLostKg,
    remainingKg,
    progressPct: program.progressPct,
    weekDeltaKg: deltaSince(weekStart, sorted),
    monthDeltaKg: deltaSince(monthAgo, sorted),
    isProgressing: totalLostKg > 0,
  };
}

export function checkInDelta(
  checkIn: WeightCheckInPublic,
  previous: WeightCheckInPublic | undefined,
): number | null {
  if (!previous) return null;
  return round1(checkIn.weight - previous.weight);
}

export function formatDeltaKg(delta: number | null): string {
  if (delta == null) return "—";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} kg`;
}

export function isCheckInPendingThisWeek(checkIns: WeightCheckInPublic[]): boolean {
  return !hasCheckInThisWeekQuebec(
    checkIns.map((c) => ({ recordedAt: c.recordedAt })),
  );
}

export function energyLabel(level: number | null): string {
  if (level == null) return "—";
  return `${level}/5`;
}

export const NAUSEE_LABELS = [
  "Aucune",
  "Légères",
  "Modérées",
  "Importantes",
  "Sévères",
  "Insupportables",
] as const;

export function nauseeLabel(level: number | null): string {
  if (level == null) return "—";
  return NAUSEE_LABELS[level] ?? `${level}/5`;
}
