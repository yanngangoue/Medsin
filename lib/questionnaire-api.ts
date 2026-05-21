import type { EligibilityStatus } from "@prisma/client";

/** Enregistrement questionnaire Prisma. */
export type QuestionnaireApiPayload = {
  id: string;
  objectif: string;
  poids: number;
  taille: number;
  imc: number;
  submittedAt: string;
  glpAntecedent?: boolean;
  glpLequel?: string | null;
  antecedents?: string[];
  medicaments?: boolean;
  medicamentsDesc?: string | null;
};

export type QuestionnaireGetResponse = {
  questionnaire: QuestionnaireApiPayload | null;
  eligibility: EligibilityStatus;
  profile?: {
    bmi: number | null;
    weightKg: number | null;
    heightCm: number | null;
    onboardingDone: boolean;
  } | null;
};

function parseQuestionnaireRecord(data: unknown): QuestionnaireApiPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "string") return null;
  return data as QuestionnaireApiPayload;
}

/** Ancien format : questionnaire seul à la racine. */
export function parseQuestionnaireResponse(data: unknown): QuestionnaireApiPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if ("questionnaire" in o) {
    return parseQuestionnaireRecord(o.questionnaire);
  }
  return parseQuestionnaireRecord(data);
}

export function parseQuestionnaireGetResponse(data: unknown): QuestionnaireGetResponse | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if ("questionnaire" in o || "eligibility" in o) {
    const q = parseQuestionnaireRecord(o.questionnaire);
    const eligibility = (o.eligibility as EligibilityStatus) ?? "PENDING";
    return {
      questionnaire: q,
      eligibility,
      profile: (o.profile as QuestionnaireGetResponse["profile"]) ?? null,
    };
  }
  const legacy = parseQuestionnaireRecord(data);
  if (!legacy) return null;
  return { questionnaire: legacy, eligibility: "PENDING" };
}
