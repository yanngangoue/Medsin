import { EligibilityStatus } from "@prisma/client";

/**
 * Simulation technique uniquement — aucun avis médical.
 * Règles démo pour un parcours MVP GLP-1.
 */
export type EligibilityInput = {
  age: number;
  bmi: number;
  medicalHistory: string;
};

function normalizeHistory(text: string): string {
  return text.trim().toLowerCase();
}

/** Détecte une « condition » associée au surpoids (simulation par mots-clés). */
function hasSimulatedWeightRelatedCondition(medicalHistory: string): boolean {
  const h = normalizeHistory(medicalHistory);
  if (h.length < 8) return false;
  const keywords = [
    "diabète",
    "diabetes",
    "hypertension",
    "cholesterol",
    "cholestérol",
    "apnée",
    "apnea",
    "nafl",
    "nafld",
    "pré-diabète",
    "prediabetes",
    "résistance",
    "insulin",
    "insuline",
    "syndrome métabolique",
    "metabolic syndrome",
    "cardiovasculaire",
    "cardiovascular",
  ];
  return keywords.some((k) => h.includes(k));
}

export function computeBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (m <= 0 || weightKg <= 0) return 0;
  const raw = weightKg / (m * m);
  return Math.round(raw * 10) / 10;
}

export function simulateGlp1Eligibility(input: EligibilityInput): {
  status: EligibilityStatus;
  /** Libellé UI — simulation logicielle uniquement, pas un avis médical. */
  labelFr: string;
} {
  const { age, bmi, medicalHistory } = input;

  /** Hors plage démo ou IMC non calculable → statut « revue » côté produit (toujours une simulation). */
  if (age < 18 || age > 120 || bmi <= 0) {
    return {
      status: EligibilityStatus.MEDICAL_REVIEW_REQUIRED,
      labelFr: "Revue médicale nécessaire",
    };
  }

  if (bmi > 30) {
    return { status: EligibilityStatus.ELIGIBLE, labelFr: "Éligible" };
  }

  if (bmi > 27 && hasSimulatedWeightRelatedCondition(medicalHistory)) {
    return { status: EligibilityStatus.ELIGIBLE, labelFr: "Éligible" };
  }

  return { status: EligibilityStatus.NOT_ELIGIBLE, labelFr: "Non éligible" };
}
