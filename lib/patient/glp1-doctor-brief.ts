import { generateText } from "@/lib/claude";
import type { Glp1HealthInfoPayload } from "@/lib/patient/glp1-dossier";
import { formatGlp1EligibilitySummary } from "@/lib/patient/glp1-eligibility-summary";

export async function generateGlp1DoctorBrief(
  payload: Glp1HealthInfoPayload,
  patientLabel: string,
): Promise<string> {
  const w = payload.wizard;
  const summary = formatGlp1EligibilitySummary(w);

  const prompt = [
    `Tu aides un médecin à préparer une revue de dossier GLP-1 (simulation MedSim) pour le patient : ${patientLabel}.`,
    "",
    "Données structurées :",
    summary,
    "",
    `Statut simulation : ${payload.eligibilityLabel}`,
    `IMC calculé : ${payload.imc}`,
    `Objectif poids : ${payload.weightGoalLabel}`,
    "",
    "Produis un BRIEF clinique de revue en français, format court :",
    "1) Synthèse (3-4 lignes factuelles)",
    "2) Points d'attention (puces, max 5)",
    "3) Questions à poser au patient (puces, max 3)",
    "",
    "Contraintes strictes :",
    "- Pas de diagnostic définitif ni de prescription.",
    "- Pas de conseil direct au patient.",
    "- Ton professionnel, neutre.",
    "- Environ 200 mots maximum.",
  ].join("\n");

  return generateText(prompt, { maxTokens: 1024 });
}
