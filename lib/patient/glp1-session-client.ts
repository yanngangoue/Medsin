import { GLP1_ELIGIBILITY_STORAGE_KEY, type Glp1EligibilityAnswers } from "@/lib/patient/glp1-eligibility-questions";

export const GLP1_WIZARD_PROGRESS_KEY = "medsim.glp1.wizard.progress";

export type Glp1WizardProgress = {
  phase: "intro" | "questions";
  step: number;
};

export function readGlp1AnswersFromSessionStorage(): Glp1EligibilityAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GLP1_ELIGIBILITY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Glp1EligibilityAnswers;
  } catch {
    return null;
  }
}

export function readGlp1WizardProgress(): Glp1WizardProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GLP1_WIZARD_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Glp1WizardProgress;
    if (parsed?.phase !== "intro" && parsed?.phase !== "questions") return null;
    if (typeof parsed.step !== "number" || parsed.step < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistGlp1WizardProgress(progress: Glp1WizardProgress): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GLP1_WIZARD_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

export function clearGlp1EligibilitySessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(GLP1_ELIGIBILITY_STORAGE_KEY);
    sessionStorage.removeItem(GLP1_WIZARD_PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

/** Envoie le brouillon navigateur vers l’API puis efface le stockage local. */
export async function syncGlp1DraftToServer(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const answers = readGlp1AnswersFromSessionStorage();
  if (!answers?.weightGoal) {
    // Pas de brouillon local — le patient complétera l'évaluation après connexion.
    return { ok: true };
  }

  const res = await fetch("/api/onboarding/glp1-dossier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? "Enregistrement impossible." };
  }

  return { ok: true };
}
