import { sendEmail } from "@/lib/email/send-email";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export type EscaladesResult = {
  escalationsFound: number;
  notificationsSent: number;
};

function weeklyWeightLossKg(checkIns: { weight: number; recordedAt: Date }[]): number | null {
  if (checkIns.length < 2) return null;
  const sorted = [...checkIns].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  const newest = sorted[sorted.length - 1];
  const weekAgo = sorted.filter(
    (c) => newest.recordedAt.getTime() - c.recordedAt.getTime() <= 8 * 24 * 60 * 60 * 1000,
  );
  if (weekAgo.length < 2) return null;
  const oldest = weekAgo[0];
  return newest.weight - oldest.weight;
}

/** Toutes les heures — vérification des escalades urgentes (nausée sévère, perte rapide). */
export async function runEscalades(): Promise<EscaladesResult> {
  if (isDemoMode()) {
    return { escalationsFound: 0, notificationsSent: 0 };
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const checkIns = await prisma.weightCheckIn.findMany({
    where: { recordedAt: { gte: since }, status: "COMPLETED" },
    include: {
      program: {
        include: {
          user: { select: { id: true, prenom: true, email: true } },
        },
      },
    },
    orderBy: { recordedAt: "desc" },
    take: 200,
  });

  let escalationsFound = 0;
  let notificationsSent = 0;
  const handled = new Set<string>();

  for (const checkIn of checkIns) {
    const userId = checkIn.userId;
    if (handled.has(userId)) continue;

    const nauseeSevere = checkIn.nausee != null && checkIn.nausee >= 4;
    const history = await prisma.weightCheckIn.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 8,
      select: { weight: true, recordedAt: true },
    });
    const delta = weeklyWeightLossKg(history);
    const perteRapide = delta != null && delta < -2;

    if (!nauseeSevere && !perteRapide) continue;

    handled.add(userId);
    escalationsFound += 1;

    const questionnaire = await prisma.medicalQuestionnaire.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { ipsId: true },
    });

    if (questionnaire?.ipsId) {
      await prisma.chatThread.updateMany({
        where: { patientId: userId, professionalId: questionnaire.ipsId },
        data: { isUrgent: true },
      });

      const ips = await prisma.user.findUnique({
        where: { id: questionnaire.ipsId },
        select: { email: true, prenom: true },
      });

      if (ips) {
        const motif = nauseeSevere
          ? `Nausée ${checkIn.nausee}/5 signalée`
          : `Perte de poids rapide (${delta?.toFixed(1)} kg/semaine)`;

        await sendEmail({
          to: ips.email,
          subject: `[Urgent] Escalade patient — ${checkIn.program.user.prenom}`,
          template: "ips_escalation",
          entityKey: `escalation:${userId}:${checkIn.id}`,
          userId: questionnaire.ipsId,
          html: `<p>Escalade automatique : ${motif}. Consultez le dossier dans MedSim.</p>`,
          text: `Escalade : ${motif}`,
        });
        notificationsSent += 1;
      }
    }

    await prisma.appNotification.create({
      data: {
        userId,
        type: "escalation",
        title: "Suivi renforcé recommandé",
        body: "Votre IPS a été avisée. En cas d'urgence, composez le 811 ou le 911.",
      },
    });
  }

  return { escalationsFound, notificationsSent };
}
