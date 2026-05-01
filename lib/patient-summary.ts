import { generateText } from "./claude";

export type PatientSummaryInput = {
  age: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  medicalHistory: string;
};

/**
 * Produit un court résumé factuel du profil via Claude (démo).
 * Aucun diagnostic ni conseil médical — sortie descriptive uniquement.
 */
export async function generatePatientSummary(
  input: PatientSummaryInput,
): Promise<string> {
  const { age, weightKg, heightCm, bmi, medicalHistory } = input;
  const history = medicalHistory.trim();

  const prompt = [
    "Résume ce profil patient de manière claire et structurée sans donner de conseil médical :",
    "",
    "Données (contexte démo / simulation) :",
    `- Âge : ${age} ans`,
    `- Poids : ${weightKg} kg`,
    `- Taille : ${heightCm} cm`,
    `- IMC : ${bmi}`,
    `- Historique déclaré (texte libre) : ${history}`,
    "",
    "Contraintes pour ta réponse :",
    "- Ton neutre et factuel.",
    "- Court : environ 3 à 4 lignes au total.",
    "- Aucun diagnostic, aucune hypothèse médicale, aucun traitement ni recommandation.",
    "- Texte structuré et lisible (puces courtes ou lignes distinctes, sans mise en forme excessive).",
  ].join("\n");

  return generateText(prompt, { maxTokens: 512 });
}
