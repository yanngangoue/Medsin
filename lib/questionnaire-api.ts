/** Réponse `GET /api/questionnaire` : enregistrement Prisma ou `{}` si absent. */
export type QuestionnaireApiPayload = {
  id: string;
  objectif: string;
  poids: number;
  taille: number;
  imc: number;
  submittedAt: string;
};

export function parseQuestionnaireResponse(data: unknown): QuestionnaireApiPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "string") return null;
  return data as QuestionnaireApiPayload;
}
