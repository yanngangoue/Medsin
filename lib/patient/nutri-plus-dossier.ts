import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { NutriPlusAnswers } from "@/lib/patient/nutri-plus-questions";
import {
  buildNutriPlusHealthPayload,
  type NutriPlusHealthPayload,
} from "@/lib/patient/nutri-plus-session";

export const NUTRI_PLUS_HEALTH_KEY = "nutriPlus";

const nutriAnswersSchema = z.object({
  primaryGoal: z.string().min(1),
  activityLevel: z.string().min(1),
  supplementExperience: z.string().min(1),
  dietaryConstraints: z.array(z.string()).min(1),
  energyFocus: z.string().min(1),
  monthlyBudget: z.string().min(1),
  coachPreference: z.string().min(1),
  notes: z.string(),
});

export function parseNutriPlusHealthInfo(
  healthInfo: unknown,
): NutriPlusHealthPayload | null {
  if (!healthInfo || typeof healthInfo !== "object") return null;
  const nested = (healthInfo as Record<string, unknown>)[NUTRI_PLUS_HEALTH_KEY];
  if (!nested || typeof nested !== "object") return null;
  const payload = nested as NutriPlusHealthPayload;
  if (payload.service !== "nutri-plus" || payload.version !== 1) return null;
  return payload;
}

export function hasNutriPlusDossier(healthInfo: unknown): boolean {
  return parseNutriPlusHealthInfo(healthInfo) !== null;
}

export async function getNutriPlusDossierForUser(userId: string): Promise<{
  submitted: boolean;
  answers: NutriPlusAnswers | null;
  submittedAt: string | null;
}> {
  const profile = await prisma.patientProfile.findUnique({ where: { userId } });
  const payload = parseNutriPlusHealthInfo(profile?.healthInfo);
  if (!payload) {
    return { submitted: false, answers: null, submittedAt: null };
  }
  return {
    submitted: true,
    answers: payload.answers,
    submittedAt: payload.submittedAt,
  };
}

export async function persistNutriPlusDossier(
  userId: string,
  answers: NutriPlusAnswers,
  displayName?: string,
): Promise<{ submittedAt: string }> {
  const parsed = nutriAnswersSchema.safeParse(answers);
  if (!parsed.success) {
    throw new Error("INVALID_NUTRI_ANSWERS");
  }

  const payload = buildNutriPlusHealthPayload(parsed.data);
  const existing = await prisma.patientProfile.findUnique({ where: { userId } });
  const prior =
    existing?.healthInfo && typeof existing.healthInfo === "object"
      ? (existing.healthInfo as Record<string, unknown>)
      : {};

  const mergedHealthInfo = {
    ...prior,
    [NUTRI_PLUS_HEALTH_KEY]: payload,
  };

  await prisma.patientProfile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: displayName ?? "",
      eligibility: "PENDING",
      onboardingDone: true,
      healthInfo: mergedHealthInfo as unknown as Prisma.InputJsonValue,
    },
    update: {
      onboardingDone: true,
      healthInfo: mergedHealthInfo as unknown as Prisma.InputJsonValue,
      ...(displayName ? { fullName: displayName } : {}),
    },
  });

  return { submittedAt: payload.submittedAt };
}
