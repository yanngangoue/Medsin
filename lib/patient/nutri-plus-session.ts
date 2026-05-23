import {
  EMPTY_NUTRI_ANSWERS,
  NUTRI_PLUS_STORAGE_KEY,
  type NutriPlusAnswers,
} from "@/lib/patient/nutri-plus-questions";

export function readNutriPlusAnswers(): NutriPlusAnswers {
  if (typeof window === "undefined") return { ...EMPTY_NUTRI_ANSWERS };
  try {
    const raw = sessionStorage.getItem(NUTRI_PLUS_STORAGE_KEY);
    if (!raw) return { ...EMPTY_NUTRI_ANSWERS };
    return { ...EMPTY_NUTRI_ANSWERS, ...JSON.parse(raw) } as NutriPlusAnswers;
  } catch {
    return { ...EMPTY_NUTRI_ANSWERS };
  }
}

export function writeNutriPlusAnswers(answers: NutriPlusAnswers): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NUTRI_PLUS_STORAGE_KEY, JSON.stringify(answers));
}

export function clearNutriPlusAnswers(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(NUTRI_PLUS_STORAGE_KEY);
}

export type NutriPlusHealthPayload = {
  version: 1;
  service: "nutri-plus";
  answers: NutriPlusAnswers;
  submittedAt: string;
};

export function buildNutriPlusHealthPayload(answers: NutriPlusAnswers): NutriPlusHealthPayload {
  return {
    version: 1,
    service: "nutri-plus",
    answers,
    submittedAt: new Date().toISOString(),
  };
}
