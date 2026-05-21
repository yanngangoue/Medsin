import {
  GLP1_ELIGIBILITY_STORAGE_KEY,
  GLP1_WIZARD_STEP_COUNT,
  type Glp1EligibilityAnswers,
} from "@/lib/patient/glp1-eligibility-questions";
import {
  persistGlp1WizardProgress,
  readGlp1AnswersFromSessionStorage,
} from "@/lib/patient/glp1-session-client";

export const GLP1_EVALUATION_PATH = "/onboarding/gestion-poids/evaluation";

/** URL qui rouvre le questionnaire (pas l’écran « Commencer »). */
export function glp1QuestionnaireResumeUrl(): string {
  return `${GLP1_EVALUATION_PATH}?resume=questions`;
}

/** URL qui ouvre le questionnaire depuis le début des questions. */
export function glp1QuestionnaireStartUrl(): string {
  return `${GLP1_EVALUATION_PATH}?start=questions`;
}

export function hasMeaningfulGlp1Answers(answers: Glp1EligibilityAnswers | null | undefined): boolean {
  return Boolean(answers?.weightGoal);
}

export function isGlp1StepComplete(step: number, answers: Glp1EligibilityAnswers): boolean {
  switch (step) {
    case 0:
      return Boolean(answers.weightGoal);
    case 1:
      return Boolean(answers.heightCm && answers.weightKg && answers.idealWeightKg);
    case 2:
      return Boolean(answers.gender);
    case 3:
      return Boolean(answers.birthMonth && answers.birthDay && answers.birthYear);
    case 4:
      return (answers.health1?.length ?? 0) > 0;
    case 5:
      return (answers.health2?.length ?? 0) > 0;
    case 6:
      return (answers.health3?.length ?? 0) > 0;
    case 7:
      return Boolean(answers.opioids3Months);
    case 8:
      return Boolean(answers.bariatricSurgery);
    case 9:
      return Boolean(answers.prescriptionMeds);
    case 10:
      return Boolean(answers.bloodPressure);
    case 11:
      return Boolean(answers.restingHeartRate);
    default:
      return false;
  }
}

/** Dernière étape remplie — pour reprendre la modification du questionnaire. */
export function inferLastCompletedGlp1Step(answers: Glp1EligibilityAnswers): number {
  let last = 0;
  for (let s = 0; s < GLP1_WIZARD_STEP_COUNT; s++) {
    if (isGlp1StepComplete(s, answers)) last = s;
  }
  return last;
}

/** Conserve brouillon + position pour un retour depuis confirmation / inscription. */
export function seedGlp1SessionForResume(answers: Glp1EligibilityAnswers): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GLP1_ELIGIBILITY_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* ignore */
  }
  persistGlp1WizardProgress({
    phase: "questions",
    step: inferLastCompletedGlp1Step(answers),
  });
}

export function readGlp1ResumeStep(): number {
  const answers = readGlp1AnswersFromSessionStorage();
  if (!hasMeaningfulGlp1Answers(answers)) return 0;
  return inferLastCompletedGlp1Step(answers!);
}
