import type { Prisma } from "@prisma/client";
import { computeBmi } from "@/lib/eligibility";
import type { MedicalQuestionnaireDraft } from "@/lib/schemas/medical-questionnaire-v2";
import { prisma } from "@/lib/prisma";

function draftDefaults(userId: string, draft: MedicalQuestionnaireDraft): Prisma.MedicalQuestionnaireCreateInput {
  const height = draft.height ?? 170;
  const weight = draft.weight ?? 80;
  return {
    user: { connect: { id: userId } },
    height,
    weight,
    bmi: computeBmi(weight, height),
    targetWeight: draft.targetWeight ?? weight - 5,
    medicalHistory: {},
    currentMedications: [],
    allergies: {},
    familyHistory: {},
    hasTried: draft.triedWeightLoss ?? false,
    motivations: draft.motivation ?? "",
    consentMedical: false,
    consentDataSharing: false,
    consentAiCoach: false,
    status: "DRAFT",
    draftJson: draft as Prisma.InputJsonValue,
  };
}

export async function saveQuestionnaireDraft(
  userId: string,
  draft: MedicalQuestionnaireDraft,
): Promise<void> {
  const existing = await prisma.medicalQuestionnaire.findFirst({
    where: { userId, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    await prisma.medicalQuestionnaire.update({
      where: { id: existing.id },
      data: { draftJson: draft as Prisma.InputJsonValue, updatedAt: new Date() },
    });
    return;
  }

  await prisma.medicalQuestionnaire.create({
    data: draftDefaults(userId, draft),
  });
}

export async function loadQuestionnaireDraft(
  userId: string,
): Promise<MedicalQuestionnaireDraft | null> {
  const row = await prisma.medicalQuestionnaire.findFirst({
    where: { userId, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });
  if (!row?.draftJson || typeof row.draftJson !== "object") return null;
  return row.draftJson as MedicalQuestionnaireDraft;
}
