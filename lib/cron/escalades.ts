import { detecterEscalade } from "@/lib/coach-ia";
import { saveAnneIpsReport } from "@/lib/anne/reports";
import { sendEmail } from "@/lib/email/send-email";
import { toCheckInPublic } from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export type EscaladesResult = {
  escalationsFound: number;
  notificationsSent: number;
};

/** Toutes les heures — vérification des escalades urgentes. */
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

    const historyRows = await prisma.weightCheckIn.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 14,
    });
    const historique = historyRows.map(toCheckInPublic);
    const latestRow = historyRows[0];
    const latest = historique[0];
    if (!latest || !latestRow) continue;

    const escalade = detecterEscalade(latest, historique);
    if (!escalade) continue;

    if (latestRow.isEscalation) {
      handled.add(userId);
      continue;
    }

    handled.add(userId);
    escalationsFound += 1;

    await prisma.weightCheckIn.update({
      where: { id: latest.id },
      data: { isEscalation: true },
    });

    const questionnaire = await prisma.medicalQuestionnaire.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { ipsId: true },
    });

    const prenom = checkIn.program.user.prenom ?? "Patient";
    const motifParts: string[] = [];
    if (latest.nausee != null && latest.nausee >= 4) {
      motifParts.push(`Nausées ${latest.nausee}/5`);
    }
    const sorted = [...historique].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inWeek = sorted.filter((c) => new Date(c.recordedAt).getTime() >= weekAgo);
    if (inWeek.length >= 2) {
      const delta = inWeek[inWeek.length - 1]!.weight - inWeek[0]!.weight;
      if (delta < -2) motifParts.push(`Perte ${Math.abs(delta).toFixed(1)} kg/7 j`);
    }
    const recent3 = sorted.slice(-3);
    if (recent3.length >= 3 && recent3.every((c) => c.energie != null && c.energie <= 1)) {
      motifParts.push("Énergie ≤ 1/5 sur 3 bilans hebdomadaires");
    }
    const motif = motifParts.join(" · ") || "Critères d'escalade atteints";

    if (questionnaire?.ipsId) {
      await prisma.chatThread.updateMany({
        where: { patientId: userId, professionalId: questionnaire.ipsId },
        data: { isUrgent: true },
      });

      const rapportContent = `ESCALADE AUTOMATIQUE — ${prenom}\n${motif}\nConsultez le dossier dans MedSim.`;

      await saveAnneIpsReport({
        userId,
        ipsId: questionnaire.ipsId,
        content: rapportContent,
        kind: "CHECK_IN",
        isEscalation: true,
      });

      const ips = await prisma.user.findUnique({
        where: { id: questionnaire.ipsId },
        select: { email: true, prenom: true },
      });

      if (ips) {
        await sendEmail({
          to: ips.email,
          subject: `[Urgent] Escalade patient — ${prenom}`,
          template: "ips_escalation",
          entityKey: `escalation:hourly:${userId}:${latest.id}`,
          userId: questionnaire.ipsId,
          html: `<p>Escalade automatique Anne : ${motif}. Consultez le dossier dans MedSim.</p>`,
          text: `Escalade : ${motif}`,
        });
        notificationsSent += 1;
      }

      await prisma.appNotification.create({
        data: {
          userId: questionnaire.ipsId,
          type: "ESCALADE",
          title: "Escalade patient — Anne",
          body: `${prenom} : ${motif}`,
        },
      });
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
