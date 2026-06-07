export const ELIGIBILITY_SESSION_KEY = "medsim.eligibility.sessionId";
export const ELIGIBILITY_DRAFT_KEY = "medsim.eligibility.draft";
export const ELIGIBILITY_RESULT_KEY = "medsim.eligibility.result";

export function getOrCreateEligibilitySessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(ELIGIBILITY_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(ELIGIBILITY_SESSION_KEY, id);
  }
  return id;
}

export type EligibilityDraft = {
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  hasDiabetes: "yes" | "no" | "unknown";
  hasThyroidOrPancreatitis: boolean;
  isPregnantOrNursing: boolean;
};

export function saveEligibilityDraft(draft: EligibilityDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ELIGIBILITY_DRAFT_KEY, JSON.stringify(draft));
}

export function readEligibilityDraft(): EligibilityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ELIGIBILITY_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EligibilityDraft;
  } catch {
    return null;
  }
}
