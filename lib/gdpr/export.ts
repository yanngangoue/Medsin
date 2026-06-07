import { decryptMedicalField } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

export async function buildPatientDataExport(userId: string): Promise<Record<string, unknown>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      prenom: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const [questionnaires, eligibility, program, fulfillments, chatThreads, privacy] =
    await Promise.all([
      prisma.medicalQuestionnaire.findMany({ where: { userId } }),
      prisma.eligibilityCheck.findMany({ where: { userId } }),
      prisma.weightProgram.findUnique({
        where: { userId },
        include: { checkIns: true, aiMessages: true },
      }),
      prisma.medicationFulfillment.findMany({ where: { userId } }),
      prisma.chatThread.findMany({
        where: { patientId: userId },
        include: { messages: true },
      }),
      prisma.patientPrivacyConsent.findUnique({ where: { userId } }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    eligibilityChecks: eligibility,
    medicalQuestionnaires: questionnaires,
    weightProgram: program,
    medicationFulfillments: fulfillments,
    chatThreads: chatThreads.map((t) => ({
      ...t,
      messages: t.messages.map((m) => ({
        ...m,
        content: decryptMedicalField(m.content),
      })),
    })),
    privacyConsent: privacy,
    retentionNotice:
      "Données médicales conservées 7 ans (obligation légale Québec). Logs de clavardage : 2 ans.",
  };
}
