import {
  coachRepondre,
  messageAccueilCoach,
  messageProactifApresCheckIn,
} from "@/lib/coach-ia";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";

export type AiCoachMessagePublic = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export function toAiCoachMessagePublic(row: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}): AiCoachMessagePublic {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCoachMessages(
  userId: string,
  limit = 40,
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

  let content: string;
  try {
    content = await messageAccueilCoach(input.program, { prenom: input.prenom });
  } catch {
    content = `Bonjour ${input.prenom} — je suis Anne, votre coach santé MedSim. Vous progressez vers votre objectif de ${input.program.targetWeight.toFixed(1)} kg. Comment vous sentez-vous cette semaine ?`;
  }

  const row = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "assistant",
      content,
    },
  });
  return toAiCoachMessagePublic(row);
}

/** Appelé automatiquement après chaque check-in — persiste le message proactif du coach. */
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

  let content: string;
  try {
    content = await messageProactifApresCheckIn(input.program, input.dernierCheckIn, {
      prenom: input.prenom,
      checkInsRecents: input.program.recentCheckIns,
    });
  } catch {
    const delta =
      input.program.recentCheckIns.length >= 2
        ? input.dernierCheckIn.weight - input.program.recentCheckIns[1]!.weight
        : null;
    content =
      delta != null && delta < 0
        ? `Beau travail — ${Math.abs(delta).toFixed(1)} kg de moins depuis votre dernier check-in. Gardez cette régularité cette semaine.`
        : `Check-in enregistré à ${input.dernierCheckIn.weight.toFixed(1)} kg. Continuez vos pesées régulières — c'est ce qui fait la différence avec votre parcours GLP-1.`;
  }

  const row = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: input.userId,
      role: "assistant",
      content,
    },
  });
  return toAiCoachMessagePublic(row);
}
