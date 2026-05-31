import type { EligibilityStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { computeBmi, simulateGlp1Eligibility } from "@/lib/eligibility";
import { prisma } from "@/lib/prisma";
import {
  GLP1_BLOOD_PRESSURE_OPTIONS,
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
  GLP1_HEART_RATE_OPTIONS,
  MONTHS_FR,
  type Glp1EligibilityAnswers,
} from "@/lib/patient/glp1-eligibility-questions";
import { GLP1_WEIGHT_GOAL_OPTIONS } from "@/lib/patient/glp1-weight-goal";
import { formatGlp1EligibilitySummary } from "@/lib/patient/glp1-eligibility-summary";
import { runGlp1PreDiagnosticTriage, type Glp1TriageResult } from "@/lib/patient/glp1-triage";

export const GLP1_HEALTH_INFO_VERSION = 1;

export type Glp1HealthInfoPayload = {
  version: typeof GLP1_HEALTH_INFO_VERSION;
  wizard: Glp1EligibilityAnswers;
  submittedAt: string;
  weightGoalLabel: string;
  eligibilityLabel: string;
  imc: number;
  triage?: Glp1TriageResult;
};

const yesNoSchema = z.enum(["oui", "non"]);
const genderSchema = z.enum(["male", "female"]);

export const glp1AnswersSchema = z.object({
  weightGoal: z.string().min(1),
  heightCm: z.string().min(1),
  weightKg: z.string().min(1),
  idealWeightKg: z.string().min(1),
  gender: genderSchema,
  birthMonth: z.string().min(1),
  birthDay: z.string().min(1),
  birthYear: z.string().min(4),
  health1: z.array(z.string()).min(1),
  health2: z.array(z.string()).min(1),
  health3: z.array(z.string()).min(1),
  opioids3Months: yesNoSchema,
  bariatricSurgery: yesNoSchema,
  prescriptionMeds: yesNoSchema,
  bloodPressure: z.enum(["normal", "elevated", "stage1", "stage2"]),
  restingHeartRate: z.enum(["slow", "normal", "slightly_fast", "fast"]),
});

const ALL_HEALTH = [...GLP1_HEALTH_1, ...GLP1_HEALTH_2, ...GLP1_HEALTH_3];

function healthIdsToLabels(ids: string[]): string[] {
  const labels: string[] = [];
  for (const id of ids) {
    const label = ALL_HEALTH.find((h) => h.id === id)?.label;
    if (label) labels.push(label);
  }
  return labels;
}

export function glp1AnswersToMedicalHistory(answers: Glp1EligibilityAnswers): string {
  const ids = [
    ...(answers.health1 ?? []),
    ...(answers.health2 ?? []),
    ...(answers.health3 ?? []),
  ].filter(
    (id) =>
      id !== GLP1_HEALTH_NONE_IDS.health1 &&
      id !== GLP1_HEALTH_NONE_IDS.health2 &&
      id !== GLP1_HEALTH_NONE_IDS.health3,
  );
  if (ids.length === 0) return "aucun antécédent déclaré";
  return healthIdsToLabels(ids).join(", ");
}

export function computeAgeFromGlp1Birth(answers: Glp1EligibilityAnswers): number {
  const monthIndex = MONTHS_FR.indexOf(answers.birthMonth as (typeof MONTHS_FR)[number]);
  const month = monthIndex >= 0 ? monthIndex : 0;
  const day = Number.parseInt(answers.birthDay ?? "1", 10);
  const year = Number.parseInt(answers.birthYear ?? "1990", 10);
  const birth = new Date(year, month, Number.isFinite(day) ? day : 1);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

/** Conditions ou réponses nécessitant une revue humaine avant toute simulation positive. */
export function glp1RequiresMedicalReview(answers: Glp1EligibilityAnswers): boolean {
  const h1 = answers.health1 ?? [];
  if (h1.some((id) => id !== GLP1_HEALTH_NONE_IDS.health1)) return true;

  if (
    answers.opioids3Months === "oui" ||
    answers.bariatricSurgery === "oui" ||
    answers.prescriptionMeds === "oui"
  ) {
    return true;
  }
  if (answers.bloodPressure === "stage2") return true;
  if (answers.restingHeartRate === "fast") return true;

  const age = computeAgeFromGlp1Birth(answers);
  if (age < 18) return true;

  return false;
}

export function resolveGlp1Eligibility(answers: Glp1EligibilityAnswers): {
  status: EligibilityStatus;
  labelFr: string;
  bmi: number;
  age: number;
  medicalHistory: string;
} {
  const weightKg = Number.parseFloat(answers.weightKg ?? "0");
  const heightCm = Number.parseFloat(answers.heightCm ?? "0");
  const bmi = computeBmi(weightKg, heightCm);
  const age = computeAgeFromGlp1Birth(answers);
  const medicalHistory = glp1AnswersToMedicalHistory(answers);

  if (glp1RequiresMedicalReview(answers)) {
    return {
      status: "MEDICAL_REVIEW_REQUIRED",
      labelFr: "Revue médicale nécessaire",
      bmi,
      age,
      medicalHistory,
    };
  }

  const { status, labelFr } = simulateGlp1Eligibility({ age, bmi, medicalHistory });
  return { status, labelFr, bmi, age, medicalHistory };
}

export function parseGlp1HealthInfo(raw: unknown): Glp1HealthInfoPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== GLP1_HEALTH_INFO_VERSION || !o.wizard) return null;
  return raw as Glp1HealthInfoPayload;
}

export function hasGlp1Dossier(healthInfo: unknown): boolean {
  return parseGlp1HealthInfo(healthInfo) !== null;
}

export type Glp1DossierSummary = ReturnType<typeof formatGlp1EligibilitySummary> & {
  imc: number;
  eligibility: EligibilityStatus;
  eligibilityLabel: string;
  submittedAtIso: string;
  excluded?: boolean;
  triageReasons?: Glp1TriageResult["reasons"];
};

export function buildGlp1DossierSummary(
  answers: Glp1EligibilityAnswers,
  eligibility: EligibilityStatus,
  eligibilityLabel: string,
  bmi: number,
  submittedAt: Date,
): Glp1DossierSummary {
  const base = formatGlp1EligibilitySummary(answers);
  return {
    ...base,
    measures: `${answers.weightKg} kg · ${answers.heightCm} cm · IMC ${bmi}`,
    imc: bmi,
    eligibility,
    eligibilityLabel,
    submittedAtIso: submittedAt.toISOString(),
    submittedAt: submittedAt.toLocaleDateString("fr-CA", { dateStyle: "long" }),
  };
}

export async function persistGlp1Dossier(
  userId: string,
  answers: Glp1EligibilityAnswers,
  displayName?: string,
): Promise<Glp1DossierSummary> {
  const parsed = glp1AnswersSchema.safeParse(answers);
  if (!parsed.success) {
    throw new Error("INVALID_GLP1_ANSWERS");
  }

  const data = parsed.data;
  const triage = runGlp1PreDiagnosticTriage(data);
  const { status, labelFr, bmi, age, medicalHistory } = resolveGlp1Eligibility(data);
  const submittedAt = new Date();
  const weightKg = Number.parseFloat(data.weightKg);
  const heightCm = Number.parseFloat(data.heightCm);

  const eligibility: EligibilityStatus = triage.excluded
    ? "NOT_ELIGIBLE"
    : "MEDICAL_REVIEW_REQUIRED";
  const eligibilityLabel = triage.excluded
    ? "Non admissible au parcours GLP-1 (tri pré-diagnostique)"
    : "En attente d'évaluation par un professionnel de santé";

  const healthPayload: Glp1HealthInfoPayload = {
    version: GLP1_HEALTH_INFO_VERSION,
    wizard: data,
    submittedAt: submittedAt.toISOString(),
    weightGoalLabel:
      GLP1_WEIGHT_GOAL_OPTIONS.find((o) => o.id === data.weightGoal)?.label ?? data.weightGoal,
    eligibilityLabel,
    imc: bmi,
    triage,
  };

  const bpLabel =
    GLP1_BLOOD_PRESSURE_OPTIONS.find((o) => o.id === data.bloodPressure)?.hint ?? data.bloodPressure;
  const hrLabel =
    GLP1_HEART_RATE_OPTIONS.find((o) => o.id === data.restingHeartRate)?.hint ??
    data.restingHeartRate;

  const extendedHealthInfo = {
    ...healthPayload,
    clinicalSnapshot: {
      bloodPressure: bpLabel,
      heartRate: hrLabel,
      opioids3Months: data.opioids3Months,
      bariatricSurgery: data.bariatricSurgery,
      prescriptionMeds: data.prescriptionMeds,
    },
  };

  const birthMonthIndex = MONTHS_FR.indexOf(data.birthMonth as (typeof MONTHS_FR)[number]);
  const dateOfBirth = new Date(
    Number.parseInt(data.birthYear, 10),
    birthMonthIndex >= 0 ? birthMonthIndex : 0,
    Number.parseInt(data.birthDay, 10) || 1,
  );

  await prisma.patientProfile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: displayName ?? "",
      dateOfBirth,
      gender: data.gender,
      age,
      weightKg,
      heightCm,
      bmi,
      medicalHistory,
      eligibility,
      onboardingDone: true,
      healthInfo: extendedHealthInfo as unknown as Prisma.InputJsonValue,
    },
    update: {
      dateOfBirth,
      gender: data.gender,
      age,
      weightKg,
      heightCm,
      bmi,
      medicalHistory,
      eligibility,
      onboardingDone: true,
      healthInfo: extendedHealthInfo as unknown as Prisma.InputJsonValue,
      ...(displayName ? { fullName: displayName } : {}),
    },
  });

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { userId },
    select: { id: true },
  });

  const suggestionText = triage.excluded
    ? `Tri pré-diagnostique : exclusion automatique (${triage.reasons.length} critère(s)). Décision thérapeutique : non applicable à cette étape.`
    : `Suggestion système (non médicale) : ${labelFr}. ` +
      `Basée sur IMC ${bmi.toFixed(1)} et critères déclaratifs uniquement. ` +
      `Simulation : ${status}. Décision finale : professionnel de santé uniquement.`;

  await prisma.dossierGlp1.create({
    data: {
      patientId: userId,
      questionnaireId: questionnaire?.id ?? null,
      status: triage.excluded ? "EXCLU_PRE_DIAGNOSTIC" : "EN_ATTENTE_MEDECIN",
      suggestionImc: bmi,
      suggestionEligibilite: suggestionText,
      healthInfoSnapshot: extendedHealthInfo as unknown as Prisma.InputJsonValue,
      triageSnapshot: triage as unknown as Prisma.InputJsonValue,
      motifRefus: triage.excluded
        ? triage.reasons.map((r) => r.labelFr).join(" · ")
        : null,
    },
  });

  return {
    ...buildGlp1DossierSummary(data, eligibility, eligibilityLabel, bmi, submittedAt),
    excluded: triage.excluded,
    triageReasons: triage.reasons,
  };
}

export async function getGlp1DossierForUser(userId: string): Promise<{
  submitted: boolean;
  summary: Glp1DossierSummary | null;
  /** Réponses du wizard — pour reprendre le questionnaire. */
  answers: Glp1EligibilityAnswers | null;
}> {
  const profile = await prisma.patientProfile.findUnique({ where: { userId } });
  const payload = parseGlp1HealthInfo(profile?.healthInfo);
  if (!payload || !profile) {
    return { submitted: false, summary: null, answers: null };
  }

  const bmi = profile.bmi ?? payload.imc;
  const submittedAt = new Date(payload.submittedAt);
  return {
    submitted: true,
    answers: payload.wizard,
    summary: buildGlp1DossierSummary(
      payload.wizard,
      profile.eligibility,
      payload.eligibilityLabel,
      bmi,
      submittedAt,
    ),
  };
}
