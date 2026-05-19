import type { FhirObservation } from "@/lib/interop/fhir/observation";
import type { MetabolicAiResult } from "@/lib/metabolic/ai-pipeline";

/** Observation « panel » agrégée — synthèse Profil métabolique (affiche une vue IA unique). */
export function buildMetabolicPanelObservation(input: {
  patientUserId: string;
  nutritionalScore: number;
  metabolicStabilityScore: number;
  adherenceScore: number;
  lifestyleScore: number;
  riskFlags: string[];
  computedAt: string;
}): FhirObservation {
  return {
    resourceType: "Observation",
    id: `metabolic-panel-${input.patientUserId}`,
    status: "final",
    category: [{ text: "MetabolicPanel" }],
    code: {
      text: "Profil métabolique agrégé Medsim",
      coding: [
        { system: "https://medsim.local/fhir/CodeSystem/observation-kind", code: "METABOLIC_PROFILE_PANEL" },
      ],
    },
    subject: { reference: `Patient/${input.patientUserId}` },
    effectiveDateTime: input.computedAt,
    component: [
      { code: { text: "nutritionalScore" }, valueQuantity: { value: input.nutritionalScore, unit: "score", code: "1" } },
      { code: { text: "metabolicStabilityScore" }, valueQuantity: { value: input.metabolicStabilityScore, unit: "score" } },
      { code: { text: "adherenceScore" }, valueQuantity: { value: input.adherenceScore, unit: "score" } },
      { code: { text: "lifestyleScore" }, valueQuantity: { value: input.lifestyleScore, unit: "score" } },
      ...input.riskFlags.map((flag) => ({
        code: { text: "riskFlag" },
        valueString: flag,
      })),
    ],
  };
}

export function aggregateScoresFromIntakes(inputs: { aiAnalysis: unknown | null }[]): {
  nutritionalQuality: MetabolicAiResult["nutritionalQuality"];
  avgMealQuality: number;
} {
  let sum = 0;
  let n = 0;
  for (const row of inputs) {
    const a = row.aiAnalysis as { mealQualityScore?: number } | null;
    if (a?.mealQualityScore != null) {
      sum += a.mealQualityScore;
      n++;
    }
  }
  const avgMealQuality = n > 0 ? sum / n : 50;
  const nq: MetabolicAiResult["nutritionalQuality"] =
    avgMealQuality >= 70 ? "high" : avgMealQuality >= 45 ? "moderate" : "low";
  return { nutritionalQuality: nq, avgMealQuality };
}

export function qualityToScore(q: "low" | "moderate" | "high"): number {
  return q === "high" ? 82 : q === "moderate" ? 58 : 35;
}
