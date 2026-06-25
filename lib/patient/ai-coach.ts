import { analyserCheckIn, coachRepondre, detecterEscalade } from "@/lib/coach-ia";
import { saveAnneIpsReport, resolvePatientIpsId } from "@/lib/anne/reports";
import { sendEmail } from "@/lib/email/send-email";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";
import { listCheckIns } from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";

export type AiCoachMessagePublic = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isProactive: boolean;
};

export function toAiCoachMessagePublic(row: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  isProactive?: boolean;
}): AiCoachMessagePublic {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    isProactive: row.isProactive ?? false,
  };
}

export async function listCoachMessages(
  userId: string,
  limit = 30,
): Promise<AiCoachMessagePublic[]> {
  const program = await prisma.weightProgram.findUnique({ where: { userId } });
  if (!program) return [];

  const rows = await prisma.aiCoachMessage.findMany({
    where: { programId: program.id },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return rows.map(toAiCoachMessagePublic);
}

export async function sendCoachMessage(input: {
  userId: string;
  prenom: string;
  message: string;
  program: WeightProgramPublic;
}): Promise<{ userMessage: AiCoachMessagePublic; assistantMessage: AiCoachMessagePublic }> {
  const programRow = await prisma.weightProgram.findUnique({
    where: { userId: input.userId },
  });
  if (!programRow) {
    throw new Error("PROGRAM_NOT_FOUND");
  }

  const priorRows = await prisma.aiCoachMessage.findMany({
    where: { programId: programRow.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const userRow = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "user",
      content: input.message.trim(),
    },
  });

  const reply = await coachRepondre(
    {
      prenom: input.prenom,
      programme: input.program,
      checkInsRecents: input.program.recentCheckIns,
    },
    priorRows.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    input.message,
  );

  const assistantRow = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "assistant",
      content: reply,
    },
  });

  return {
    userMessage: toAiCoachMessagePublic(userRow),
    assistantMessage: toAiCoachMessagePublic(assistantRow),
  };
}

/** Message de bienvenue — première visite du coach. */
export function buildCoachWelcomeMessage(prenom: string): string {
  const name = prenom.trim() || "cher patient";
  return `Bonjour ${name}, votre traitement GLP-1 est arrivé. Je suis Anne, votre coach IA. Commençons ensemble !

Comment vous sentez-vous aujourd'hui après la réception de votre médicament ?`;
}

export function buildCoachDeliveryMessage(prenom: string): string {
  return buildCoachWelcomeMessage(prenom);
}

/** Message d'accueil si le programme poids n'est pas encore activé. */
export function buildCoachNoProgramMessage(prenom: string): string {
  const name = prenom.trim() || "cher patient";
  return `Bonjour ${name} ! 👋

Je suis Anne, votre coach santé IA chez Anne-sante.

Votre programme de suivi n'est pas encore activé — une fois votre parcours GLP-1 démarré, je pourrai analyser vos bilans hebdomadaires et vous écrire en premier chaque semaine.

En attendant, posez-moi vos questions sur le GLP-1, les effets secondaires ou votre parcours. Comment vous sentez-vous aujourd'hui ?`;
}

/** Message d'accueil proactif si l'historique est vide. */
export async function ensureCoachWelcome(input: {
  userId: string;
  prenom: string;
  program: WeightProgramPublic;
}): Promise<AiCoachMessagePublic | null> {
  const programRow = await prisma.weightProgram.findUnique({
    where: { userId: input.userId },
    include: { aiMessages: { take: 1 } },
  });
  if (!programRow || programRow.aiMessages.length > 0) return null;

  const content = buildCoachWelcomeMessage(input.prenom);

  const row = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "assistant",
      content,
      isProactive: true,
    },
  });
  return toAiCoachMessagePublic(row);
}

/** Appelé automatiquement après chaque check-in — analyse, message patient, rapport IPS, escalade. */
export async function enregistrerMessageProactifApresCheckIn(input: {
  userId: string;
  prenom: string;
  program: WeightProgramPublic;
  dernierCheckIn: WeightCheckInPublic;
}): Promise<AiCoachMessagePublic | null> {
  const programRow = await prisma.weightProgram.findUnique({
    where: { userId: input.userId },
  });
  if (!programRow) return null;

  const historique = await listCheckIns(input.userId, 14);
  let content: string;
  let rapportIps: string | null = null;
  let escalade = detecterEscalade(input.dernierCheckIn, historique);

  try {
    const analyse = await analyserCheckIn(
      input.dernierCheckIn,
      historique,
      input.program,
      { prenom: input.prenom },
    );
    content = analyse.messagePatient;
    rapportIps = analyse.rapportIps;
    escalade = analyse.escalade;
  } catch {
    const delta =
      historique.length >= 2
        ? input.dernierCheckIn.weight - historique[1]!.weight
        : null;
    content =
      delta != null && delta < 0
        ? `Beau travail — ${Math.abs(delta).toFixed(1)} kg de moins depuis votre dernier bilan hebdomadaire. Gardez cette régularité cette semaine.`
        : `Bilan hebdomadaire enregistré à ${input.dernierCheckIn.weight.toFixed(1)} kg. Continuez vos pesées régulières — c'est ce qui fait la différence avec votre parcours GLP-1.`;
  }

  await prisma.weightCheckIn.update({
    where: { id: input.dernierCheckIn.id },
    data: { aiReport: rapportIps, isEscalation: escalade },
  });

  const ipsId = await resolvePatientIpsId(input.userId);
  if (ipsId && rapportIps) {
    await saveAnneIpsReport({
      userId: input.userId,
      ipsId,
      content: rapportIps,
      kind: "CHECK_IN",
      isEscalation: escalade,
    });
  }

  if (escalade && ipsId) {
    await prisma.chatThread.updateMany({
      where: { patientId: input.userId, professionalId: ipsId },
      data: { isUrgent: true },
    });

    const ips = await prisma.user.findUnique({
      where: { id: ipsId },
      select: { email: true, prenom: true },
    });

    if (ips) {
      await sendEmail({
        to: ips.email,
        subject: `[Urgent] Escalade patient — ${input.prenom || "Patient"}`,
        template: "ips_escalation",
        entityKey: `escalation:checkin:${input.dernierCheckIn.id}`,
        userId: ipsId,
        html: `<p>Escalade détectée après bilan hebdomadaire. Consultez le rapport Anne dans Anne-sante.</p>`,
        text: "Escalade détectée après bilan hebdomadaire.",
      });
    }

    await prisma.appNotification.create({
      data: {
        userId: ipsId,
        type: "ESCALADE",
        title: "Escalade patient — Anne",
        body: `${input.prenom || "Un patient"} nécessite un suivi renforcé (bilan hebdomadaire récent).`,
      },
    });
  }

  const row = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "assistant",
      content,
      isProactive: true,
    },
  });
  return toAiCoachMessagePublic(row);
}
