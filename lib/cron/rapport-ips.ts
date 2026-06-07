import { genererRapportIps } from "@/lib/coach-ia";
import { saveAnneIpsReport } from "@/lib/anne/reports";
import { weekNumberSince } from "@/lib/anne/schedule";
import { sendEmail } from "@/lib/email/send-email";
import { listCheckIns, getWeightProgramForUser } from "@/lib/patient/weight-program";
import { listCoachMessages } from "@/lib/patient/ai-coach";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export type RapportIpsResult = {
  reportsGenerated: number;
  emailsSent: number;
};

/** Tous les vendredis à 8 h — rapport IA hebdomadaire vers chaque IPS. */
export async function runRapportIps(): Promise<RapportIpsResult> {
  if (isDemoMode()) {
    return { reportsGenerated: 0, emailsSent: 0 };
  }

  const ipsUsers = await prisma.user.findMany({
    where: { role: { in: ["IPS", "MEDECIN"] } },
    select: { id: true, email: true, prenom: true },
  });

  let reportsGenerated = 0;
  let emailsSent = 0;
  const weekKey = new Date().toISOString().slice(0, 10);

  for (const ips of ipsUsers) {
    const questionnaires = await prisma.medicalQuestionnaire.findMany({
      where: {
        ipsId: ips.id,
        status: { in: ["APPROVED", "PRESCRIPTION_ISSUED", "UNDER_REVIEW"] },
      },
      include: { user: { select: { id: true, prenom: true } } },
      take: 30,
    });

    if (questionnaires.length === 0) continue;

    const sections: string[] = [];

    for (const q of questionnaires) {
      const program = await getWeightProgramForUser(q.userId);
      if (!program) continue;

      const checkIns = await listCheckIns(q.userId, 28);
      const chatHistory = await listCoachMessages(q.userId, 20);
      const weekNum = weekNumberSince(new Date(program.startDate));

      const rapport = await genererRapportIps(
        program,
        checkIns,
        q.user.prenom ?? undefined,
        checkIns[0],
        {
          historiqueChat: chatHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          weekNumber: weekNum,
        },
      );

      await saveAnneIpsReport({
        userId: q.userId,
        ipsId: ips.id,
        content: rapport,
        kind: "WEEKLY",
        weekNumber: weekNum,
        isEscalation: checkIns[0]?.nausee != null && checkIns[0].nausee >= 4,
      });

      sections.push(rapport);
      reportsGenerated += 1;
    }

    if (sections.length === 0) continue;

    const body = sections.join("\n\n");
    const result = await sendEmail({
      to: ips.email,
      subject: "Rapport hebdomadaire Anne — MedSim",
      template: "ips_weekly_report",
      entityKey: `ips_weekly:${ips.id}:${weekKey}`,
      userId: ips.id,
      html: `<pre style="font-family:monospace;white-space:pre-wrap;font-size:13px">${body.replace(/</g, "&lt;")}</pre>`,
      text: body,
    });

    if (result.ok && !result.skipped) emailsSent += 1;
  }

  return { reportsGenerated, emailsSent };
}
