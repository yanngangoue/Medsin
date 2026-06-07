import type { CheckInFrequency, ProgramStatus, WeightCheckIn, WeightProgram } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type WeightCheckInPublic = {
  id: string;
  weight: number;
  energie: number | null;
  sommeil: number | null;
  nausee: number | null;
  notes: string | null;
  recordedAt: string;
};

export type WeightProgramPublic = {
  id: string;
  status: ProgramStatus;
  startWeight: number;
  targetWeight: number;
  currentWeight: number;
  weightLost: number;
  progressPct: number;
  startDate: string;
  targetDate: string | null;
  checkInFreq: CheckInFrequency;
  recentCheckIns: WeightCheckInPublic[];
};

function toCheckInPublic(row: WeightCheckIn): WeightCheckInPublic {
  return {
    id: row.id,
    weight: row.weight,
    energie: row.energie,
    sommeil: row.sommeil,
    nausee: row.nausee,
    notes: row.notes,
    recordedAt: row.recordedAt.toISOString(),
  };
}

function computeProgress(
  startWeight: number,
  targetWeight: number,
  currentWeight: number,
): { weightLost: number; progressPct: number } {
  const totalToLose = startWeight - targetWeight;
  const weightLost = Math.max(0, startWeight - currentWeight);
  if (totalToLose <= 0) {
    return { weightLost, progressPct: 0 };
  }
  const progressPct = Math.min(100, Math.round((weightLost / totalToLose) * 100));
  return { weightLost, progressPct };
}

export function toWeightProgramPublic(
  program: WeightProgram,
  checkIns: WeightCheckIn[],
): WeightProgramPublic {
  const { weightLost, progressPct } = computeProgress(
    program.startWeight,
    program.targetWeight,
    program.currentWeight,
  );
  return {
    id: program.id,
    status: program.status,
    startWeight: program.startWeight,
    targetWeight: program.targetWeight,
    currentWeight: program.currentWeight,
    weightLost,
    progressPct,
    startDate: program.startDate.toISOString(),
    targetDate: program.targetDate?.toISOString() ?? null,
    checkInFreq: program.checkInFreq,
    recentCheckIns: checkIns.map(toCheckInPublic),
  };
}

export async function getWeightProgramForUser(userId: string): Promise<WeightProgramPublic | null> {
  const program = await prisma.weightProgram.findUnique({
    where: { userId },
    include: {
      checkIns: { orderBy: { recordedAt: "desc" }, take: 14 },
    },
  });
  if (!program) return null;
  return toWeightProgramPublic(program, program.checkIns);
}

export async function createWeightProgram(
  userId: string,
  input: {
    startWeight: number;
    targetWeight: number;
    currentWeight?: number;
    targetDate?: Date;
    checkInFreq?: CheckInFrequency;
  },
): Promise<WeightProgramPublic> {
  const currentWeight = input.currentWeight ?? input.startWeight;
  const program = await prisma.weightProgram.create({
    data: {
      userId,
      startWeight: input.startWeight,
      targetWeight: input.targetWeight,
      currentWeight,
      targetDate: input.targetDate,
      checkInFreq: input.checkInFreq ?? "WEEKLY",
    },
    include: { checkIns: true },
  });
  return toWeightProgramPublic(program, program.checkIns);
}

export async function updateWeightProgram(
  userId: string,
  data: {
    status?: ProgramStatus;
    targetWeight?: number;
    currentWeight?: number;
    targetDate?: Date | null;
    checkInFreq?: CheckInFrequency;
    stripeSubId?: string;
  },
): Promise<WeightProgramPublic | null> {
  const existing = await prisma.weightProgram.findUnique({ where: { userId } });
  if (!existing) return null;

  const program = await prisma.weightProgram.update({
    where: { id: existing.id },
    data,
    include: {
      checkIns: { orderBy: { recordedAt: "desc" }, take: 14 },
    },
  });
  return toWeightProgramPublic(program, program.checkIns);
}

export async function addWeightCheckIn(
  userId: string,
  input: {
    weight: number;
    energie?: number;
    sommeil?: number;
    notes?: string;
  },
): Promise<{ program: WeightProgramPublic; latestCheckIn: WeightCheckInPublic } | null> {
  const program = await prisma.weightProgram.findUnique({ where: { userId } });
  if (!program) return null;

  const checkIn = await prisma.$transaction(async (tx) => {
    const row = await tx.weightCheckIn.create({
      data: {
        programId: program.id,
        userId,
        weight: input.weight,
        energie: input.energie,
        sommeil: input.sommeil,
        notes: input.notes,
      },
    });
    await tx.weightProgram.update({
      where: { id: program.id },
      data: { currentWeight: input.weight },
    });
    return row;
  });

  const updated = await getWeightProgramForUser(userId);
  if (!updated) return null;

  return {
    program: updated,
    latestCheckIn: toCheckInPublic(checkIn),
  };
}

export async function listCheckIns(userId: string, limit = 30): Promise<WeightCheckInPublic[]> {
  const program = await prisma.weightProgram.findUnique({ where: { userId } });
  if (!program) return [];

  const rows = await prisma.weightCheckIn.findMany({
    where: { programId: program.id },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });
  return rows.map(toCheckInPublic);
}
