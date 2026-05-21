import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_ELIGIBILITY_STORAGE_KEY,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEART_RATE_OPTIONS,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  type Glp1EligibilityAnswers,
} from "@/lib/patient/glp1-eligibility-questions";
import { GLP1_WEIGHT_GOAL_OPTIONS } from "@/lib/patient/glp1-weight-goal";

const allHealth = [...GLP1_HEALTH_1, ...GLP1_HEALTH_2, ...GLP1_HEALTH_3];

function healthLabels(ids: string[] | undefined): string {
  if (!ids?.length) return "—";
  if (
    ids.includes(GLP1_HEALTH_NONE_IDS.health1) ||
    ids.includes(GLP1_HEALTH_NONE_IDS.health2) ||
    ids.includes(GLP1_HEALTH_NONE_IDS.health3)
  ) {
    return "Aucune condition signalée";
  }
  const labels = ids
    .map((id) => allHealth.find((h) => h.id === id)?.label)
    .filter(Boolean);
  return labels.length ? labels.slice(0, 2).join(" · ") + (labels.length > 2 ? "…" : "") : "—";
}

export function readGlp1EligibilityFromSession(): Glp1EligibilityAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GLP1_ELIGIBILITY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Glp1EligibilityAnswers;
  } catch {
    return null;
  }
}

export function formatGlp1EligibilitySummary(data: Glp1EligibilityAnswers) {
  const goal = GLP1_WEIGHT_GOAL_OPTIONS.find((o) => o.id === data.weightGoal)?.label ?? "—";
  const bp = GLP1_BLOOD_PRESSURE_OPTIONS.find((o) => o.id === data.bloodPressure)?.hint ?? "—";
  const hr = GLP1_HEART_RATE_OPTIONS.find((o) => o.id === data.restingHeartRate)?.hint ?? "—";
  const measures =
    data.heightCm && data.weightKg
      ? `${data.weightKg} kg · ${data.heightCm} cm`
      : "—";

  return {
    goal,
    measures,
    idealWeight: data.idealWeightKg ? `${data.idealWeightKg} kg` : "—",
    bloodPressure: bp,
    heartRate: hr,
    healthNote: healthLabels([...(data.health1 ?? []), ...(data.health2 ?? []), ...(data.health3 ?? [])]),
    submittedAt: new Date().toLocaleDateString("fr-CA", { dateStyle: "long" }),
  };
}
