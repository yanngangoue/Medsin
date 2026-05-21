import type { EligibilityStatus } from "@prisma/client";
import { computeBmi, simulateGlp1Eligibility } from "@/lib/eligibility";

const ANTECEDENT_LABELS: Record<string, string> = {
  diabete_t2: "diabète type 2",
  hypertension: "hypertension",
  cardiovasculaire: "maladie cardiovasculaire",
  rein: "problèmes rénaux",
  aucun: "aucun antécédent déclaré",
};

/** Âge non collecté au questionnaire MVP — valeur neutre pour la simulation. */
const DEFAULT_QUESTIONNAIRE_AGE = 30;

export function antecedentsToMedicalHistory(antecedents: string[]): string {
  if (antecedents.includes("aucun") || antecedents.length === 0) {
    return "aucun antécédent déclaré";
  }
  return antecedents
    .filter((a) => a !== "aucun")
    .map((a) => ANTECEDENT_LABELS[a] ?? a)
    .join(", ");
}

export function eligibilityFromQuestionnaire(input: {
  poids: number;
  taille: number;
  antecedents: string[];
}): { bmi: number; status: EligibilityStatus; medicalHistory: string } {
  const bmi = computeBmi(input.poids, input.taille);
  const medicalHistory = antecedentsToMedicalHistory(input.antecedents);
  const { status } = simulateGlp1Eligibility({
    age: DEFAULT_QUESTIONNAIRE_AGE,
    bmi,
    medicalHistory,
  });
  return { bmi, status, medicalHistory };
}
