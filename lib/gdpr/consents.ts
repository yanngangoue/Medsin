import { prisma } from "@/lib/prisma";

export type Glp1Consents = {
  medical: boolean;
  dataSharing: boolean;
  aiCoach: boolean;
  privacy: boolean;
  marketing: boolean;
};

const DEFAULT_CONSENTS: Glp1Consents = {
  medical: false,
  dataSharing: false,
  aiCoach: false,
  privacy: false,
  marketing: false,
};

export function parseGlp1Consents(raw: unknown): Glp1Consents {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CONSENTS };
  const o = raw as Record<string, unknown>;
  return {
    medical: Boolean(o.medical),
    dataSharing: Boolean(o.dataSharing),
    aiCoach: Boolean(o.aiCoach),
    privacy: Boolean(o.privacy),
    marketing: Boolean(o.marketing),
  };
}

export async function getPatientConsents(userId: string): Promise<Glp1Consents> {
  const [privacy, questionnaire] = await Promise.all([
    prisma.patientPrivacyConsent.findUnique({ where: { userId } }),
    prisma.medicalQuestionnaire.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const stored = parseGlp1Consents(privacy?.glp1Consents);

  if (questionnaire) {
    return {
      medical: questionnaire.consentMedical || stored.medical,
      dataSharing: questionnaire.consentDataSharing || stored.dataSharing,
      aiCoach: questionnaire.consentAiCoach || stored.aiCoach,
      privacy: stored.privacy || questionnaire.consentMedical,
      marketing: stored.marketing,
    };
  }

  return stored;
}

export async function updatePatientConsents(
  userId: string,
  consents: Partial<Glp1Consents>,
): Promise<Glp1Consents> {
  const current = await getPatientConsents(userId);
  const merged = { ...current, ...consents };

  await prisma.patientPrivacyConsent.upsert({
    where: { userId },
    create: {
      userId,
      glp1Consents: merged,
      consentedAt: new Date(),
    },
    update: {
      glp1Consents: merged,
      consentedAt: new Date(),
    },
  });

  return merged;
}
