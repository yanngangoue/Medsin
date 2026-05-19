import {
  listMetabolicIntakes,
  saveMetabolicProfileSnapshot,
} from "@/lib/metabolic/repository";
import { buildMetabolicPanelObservation, aggregateScoresFromIntakes, qualityToScore } from "@/lib/metabolic/profile-fhir";
import type { MetabolicAiResult } from "@/lib/metabolic/ai-pipeline";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import { randomUUID } from "node:crypto";

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.sqrt(nums.reduce((s, x) => s + (x - m) ** 2, 0) / nums.length);
}

export async function recomputeMetabolicProfileForPatient(patientUserId: string): Promise<void> {
  const last30 = await listMetabolicIntakes(patientUserId, {
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });
  const meals = last30.filter((i) => i.category === "MEAL");
  const sleeps = last30.filter((i) => i.category === "SLEEP");
  const acts = last30.filter((i) => i.category === "ACTIVITY");
  const glp = last30.filter((i) => i.category === "MEDICATION_STATEMENT");
  const supp = last30.filter((i) => i.category === "SUPPLEMENT");

  const agg = aggregateScoresFromIntakes(meals.map((m) => ({ aiAnalysis: m.aiAnalysis })));
  const nutritionalScore = qualityToScore(agg.nutritionalQuality);

  const sleepHours = sleeps
    .map((s) => {
      const f = s.fhirResource as { valueQuantity?: { value?: number } };
      return f?.valueQuantity?.value;
    })
    .filter((x): x is number => typeof x === "number");
  const stabilityFromSleep = sleepHours.length ? Math.max(0, 100 - stdDev(sleepHours) * 25) : 55;
  const mealVariance = stdDev(meals.map(() => agg.avgMealQuality));
  const metabolicStabilityScore = Math.round(
    Math.min(100, Math.max(20, (stabilityFromSleep + (100 - mealVariance)) / 2)),
  );

  const expectedWeeklyDoses = 1;
  const weeks = 4;
  const adherenceRatio = glp.length / (expectedWeeklyDoses * weeks);
  const adherenceScore = Math.round(Math.min(100, Math.max(15, adherenceRatio * 100)));

  const actMinutes = acts.map((a) => {
    const f = a.fhirResource as { valueQuantity?: { value?: number } };
    return f?.valueQuantity?.value ?? 0;
  });
  const avgAct = actMinutes.length ? actMinutes.reduce((x, y) => x + y, 0) / actMinutes.length : 30;
  const lifestyleScore = Math.round(Math.min(100, Math.max(20, (avgAct / 150) * 100)));

  const riskFlags: string[] = [];
  for (const s of supp) {
    const ai = s.aiAnalysis as MetabolicAiResult | null;
    if (ai?.supplementGlpInteractionRisk === "moderate" || ai?.supplementGlpInteractionRisk === "high") {
      riskFlags.push("interaction_complement_glp:" + (ai.supplementGlpInteractionRisk ?? ""));
    }
  }
  if (sleepHours.some((h) => h < 5)) riskFlags.push("sommeil_insuffisant");

  const now = new Date().toISOString();
  const panel = buildMetabolicPanelObservation({
    patientUserId,
    nutritionalScore,
    metabolicStabilityScore,
    adherenceScore,
    lifestyleScore,
    riskFlags,
    computedAt: now,
  });

  await saveMetabolicProfileSnapshot({
    patientUserId,
    nutritionalScore,
    metabolicStabilityScore,
    adherenceScore,
    lifestyleScore,
    riskFlags,
    fhirPanelObservation: panel,
  });

  await getInteropEventBus().publish({
    id: randomUUID(),
    type: "MetabolicProfileRecomputed",
    occurredAt: now,
    tenantProvince: "QC",
    payload: { patientUserId, nutritionalScore, metabolicStabilityScore, adherenceScore, lifestyleScore },
  });
}
