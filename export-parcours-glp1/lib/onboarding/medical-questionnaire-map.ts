import { computeBmi } from "@/lib/eligibility";
import type { MedicalQuestionnaireV2 } from "@/lib/schemas/medical-questionnaire-v2";
import type { Prisma } from "@prisma/client";

export function toPrismaMedicalQuestionnaire(
  userId: string,
  data: MedicalQuestionnaireV2,
): Prisma.MedicalQuestionnaireCreateInput {
  const bmi = computeBmi(data.weight, data.height);
  return {
    user: { connect: { id: userId } },
    height: data.height,
    weight: data.weight,
    bmi,
    targetWeight: data.targetWeight,
    medicalHistory: {
      chronicConditions: data.chronicConditions,
      surgeries: data.surgeries ?? "",
      recentHospitalization: data.recentHospitalization,
      waistCm: data.waistCm ?? null,
      activityDays: data.activityDays,
      dietNotes: data.dietNotes ?? null,
      tobacco: data.tobacco,
      alcohol: data.alcohol,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel,
      medicationPreference: data.medicationPreference,
      supplements: data.supplements ?? null,
    },
    currentMedications: data.medications,
    allergies: { text: data.allergies ?? "" },
    familyHistory: {},
    hasTried: data.triedWeightLoss,
    previousAttempts: data.previousResults ?? null,
    motivations: data.motivation,
    bloodPressure: null,
    heartRate: null,
    consentMedical: data.consentMedical,
    consentDataSharing: data.consentDataSharing,
    consentAiCoach: data.consentAiCoach,
    status: "SUBMITTED",
  };
}

export function draftToPartialJson(draft: Record<string, unknown>): Record<string, unknown> {
  return draft;
}
