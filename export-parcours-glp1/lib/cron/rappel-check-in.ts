import { COACH_NAME } from "@/lib/coach-brand";
import { sendEmail } from "@/lib/email/send-email";
import { envoyerRappelHebdomadaire } from "@/lib/coach-ia";
import { getWeightProgramForUser } from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export type RappelCheckInResult = {
  patientsContacted: number;
  emailsSent: number;
  skipped: number;
};

/** Tous les lundis à 9 h — rappel check-in hebdo pour patients actifs. */
export async function runRappelCheckIn(): Promise<RappelCheckInResult> {
  if (isDemoMode()) {
    return { patientsContacted: 0, emailsSent: 0, skipped: 0 };
  }

  const programs = await prisma.weightProgram.findMany({
    where: { status: "ACTIVE", isActive: true },
    include: {
      user: { select: { id: true, email: true, prenom: true, name: true } },
      checkIns: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });

  let patientsContacted = 0;
  let emailsSent = 0;
  let skipped = 0;

  for (const program of programs) {
    const dernierCheckIn = program.checkIns[0] ?? null;
    const daysSince =
      dernierCheckIn != null
        ? (Date.now() - dernierCheckIn.recordedAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

    if (daysSince < 5) {
      skipped += 1;
      continue;
    }

    const publicProgram = await getWeightProgramForUser(program.userId);
    if (!publicProgram) {
      skipped += 1;
      continue;
    }

    const prenom = program.user.prenom || program.user.name || "Patient";
    let messageCoach = `Bonjour ${prenom}, c'est ${COACH_NAME} — l'heure de votre check-in hebdomadaire sur MedSim. Comment vous sentez-vous cette semaine ?`;

    try {
      const dernierPublic = publicProgram.recentCheckIns[0];
      messageCoach = await envoyerRappelHebdomadaire(
        publicProgram,
        dernierPublic ?? null,
        { prenom },
      );
    } catch {
      /* fallback message */
    }

    await prisma.aiCoachMessage.create({
      data: {
        programId: program.id,
        userId: program.userId,
        role: "assistant",
        content: messageCoach,
        isProactive: true,
      },
    });

    await prisma.appNotification.create({
      data: {
        userId: program.userId,
        type: "check_in_reminder",
        title: "Check-in hebdomadaire",
        body: messageCoach.slice(0, 500),
      },
    });

    const emailResult = await sendEmail({
      to: program.user.email,
      subject: "Votre check-in hebdomadaire MedSim",
      template: "weekly_checkin_reminder",
      entityKey: `weekly_checkin:${program.userId}:${new Date().toISOString().slice(0, 10)}`,
      userId: program.userId,
      html: `<p>Bonjour ${prenom},</p><p>${messageCoach}</p>`,
      text: messageCoach,
    });

    patientsContacted += 1;
    if (emailResult.ok && !emailResult.skipped) emailsSent += 1;
  }

  return { patientsContacted, emailsSent, skipped };
}
