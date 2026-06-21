import { computeBmi } from "@/lib/eligibility";
import {
  GLP1_HEALTH_1,
  GLP1_HEALTH_2,
  GLP1_HEALTH_3,
  GLP1_HEALTH_NONE_IDS,
} from "@/lib/patient/glp1-eligibility-questions";
import type { MedicalQuestionnaireV2 } from "@/lib/schemas/medical-questionnaire-v2";
import type { Prisma } from "@prisma/client";

const ALL_HEALTH = [...GLP1_HEALTH_1, ...GLP1_HEALTH_2, ...GLP1_HEALTH_3];

function healthIdsToLabels(ids: string[]): string[] {
  const labels: string[] = [];
  for (const id of ids) {
    const label = ALL_HEALTH.find((h) => h.id === id)?.label;
    if (label) labels.push(label);
  }
  return labels;
}

function clinicalHistorySummary(data: MedicalQuestionnaireV2): string[] {
  const ids = [...data.health1, ...data.health2, ...data.health3].filter(
    (id) =>
      id !== GLP1_HEALTH_NONE_IDS.health1 &&
      id !== GLP1_HEALTH_NONE_IDS.health2 &&
      id !== GLP1_HEALTH_NONE_IDS.health3,
  );
  return healthIdsToLabels(ids);
}

export function toPrismaMedicalQuestionnaire(
  userId: string,
  data: MedicalQuestionnaireV2,
): Prisma.MedicalQuestionnaireCreateInput {
  const bmi = computeBmi(data.weight, data.height);
  const clinicalLabels = clinicalHistorySummary(data);

  return {
    user: { connect: { id: userId } },
    height: data.height,
    weight: data.weight,
    bmi,
    targetWeight: data.targetWeight,
    medicalHistory: {
      gender: data.gender,
      birthDate: {
        month: data.birthMonth,
        day: data.birthDay,
        year: data.birthYear,
      },
      waistCm: data.waistCm ?? null,
      health1: data.health1,
      health2: data.health2,
      health3: data.health3,
      clinicalSummary: clinicalLabels,
      opioids3Months: data.opioids3Months,
      bariatricSurgery: data.bariatricSurgery,
      prescriptionMeds: data.prescriptionMeds,
      restingHeartRate: data.restingHeartRate,
      activityDays: data.activityDays,
      dietNotes: data.dietNotes ?? null,
      tobacco: data.tobacco,
      alcohol: data.alcohol,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel,
      medicationPreference: data.medicationPreference,
      supplements: data.supplements ?? null,
      targetTimelineMonths: data.targetTimelineMonths,
      delivery: {
        street: data.deliveryStreet,
        city: data.deliveryCity,
        province: data.deliveryProvince.toUpperCase(),
        postalCode: data.deliveryPostalCode,
        phone: data.deliveryPhone,
        adresseLivraison: `${data.deliveryStreet}, ${data.deliveryCity}, ${data.deliveryProvince} ${data.deliveryPostalCode}`,
      },
    },
    currentMedications: data.medications,
    allergies: { text: data.allergies ?? "" },
    familyHistory: {
      thyroidOrMen2: data.health3.includes("thyroid_cancer_history"),
    },
    hasTried: data.triedWeightLoss,
    previousAttempts: data.previousResults ?? null,
    motivations: data.motivation,
    bloodPressure: data.bloodPressure,
    heartRate: null,
    consentMedical: data.consentMedical,
    consentDataSharing: data.consentDataSharing,
    consentAiCoach: data.consentAiCoach,
    status: "SUBMITTED",
    draftJson: {
      deliveryAddress: data.deliveryStreet,
      deliveryCity: data.deliveryCity,
      deliveryProvince: data.deliveryProvince,
      deliveryPostalCode: data.deliveryPostalCode,
      deliveryPhone: data.deliveryPhone,
      adresseLivraison: `${data.deliveryStreet}, ${data.deliveryCity}, ${data.deliveryProvince} ${data.deliveryPostalCode}`,
      targetTimelineMonths: data.targetTimelineMonths,
    },
  };
}

export function draftToPartialJson(draft: Record<string, unknown>): Record<string, unknown> {
  return draft;
}
