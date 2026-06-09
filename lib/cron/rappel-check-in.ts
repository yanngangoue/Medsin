import { COACH_NAME } from "@/lib/coach-brand";
import { hasCheckInThisWeekQuebec } from "@/lib/anne/schedule";
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

const POIDS_DASHBOARD_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

/** Chaque lundi 9 h (Québec) — rappel check-in hebdo pour patients actifs. */
export async function runRappelCheckIn(): Promise<RappelCheckInResult> {
  if (isDemoMode()) {
    return { patientsContacted: 0, emailsSent: 0, skipped: 0 };
  }

  const programs = await prisma.weightProgram.findMany({
    where: { status: "ACTIVE", isActive: true },
    include: {
      user: { select: { id: true, email: true, prenom: true, name: true } },
      checkIns: { orderBy: { recordedAt: "desc" }, take: 14 },
    },
  });

  let patientsContacted = 0;
  let emailsSent = 0;
  let skipped = 0;
  const weekKey = new Date().toISOString().slice(0, 10);

  for (const program of programs) {
    const checkInThisWeek = hasCheckInThisWeekQuebec(program.checkIns);
    if (checkInThisWeek) {
      skipped += 1;
      continue;
    }

    const publicProgram = await getWeightProgramForUser(program.userId);
    if (!publicProgram) {
      skipped += 1;
      continue;
    }

    const prenom = program.user.prenom || program.user.name || "Patient";
    let messageCoach = `Bonjour ${prenom}, c'est ${COACH_NAME} — l'heure de votre bilan hebdomadaire sur MedSim. Comment vous sentez-vous cette semaine ?`;

    try {
      const dernierPublic = publicProgram.recentCheckIns[0];
      messageCoach = await envoyerRappelHebdomadaire(publicProgram, dernierPublic ?? null, {
        prenom,
      });
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
        title: "Bilan hebdomadaire",
        body: messageCoach.slice(0, 500),
      },
    });

    const preview =
      messageCoach.length > 180 ? `${messageCoach.slice(0, 177)}…` : messageCoach;
    const poidsLink = `${POIDS_DASHBOARD_URL}/dashboard/patient/poids`;

    const emailResult = await sendEmail({
      to: program.user.email,
      subject: "Anne a un message pour vous 🌿",
      template: "weekly_checkin_reminder",
      entityKey: `weekly_checkin:${program.userId}:${weekKey}`,
      userId: program.userId,
      html: `<p>Bonjour ${prenom},</p><p>${preview}</p><p><a href="${poidsLink}">Faire mon bilan hebdomadaire →</a></p>`,
      text: `${preview}\n\nFaire mon bilan hebdomadaire : ${poidsLink}`,
    });

    patientsContacted += 1;
    if (emailResult.ok && !emailResult.skipped) emailsSent += 1;
  }

  return { patientsContacted, emailsSent, skipped };
}
