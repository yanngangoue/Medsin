import type { AnneReportKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function saveAnneIpsReport(input: {
  userId: string;
  ipsId: string;
  content: string;
  kind: AnneReportKind;
  weekNumber?: number;
  isEscalation?: boolean;
}): Promise<string> {
  const row = await prisma.anneIpsReport.create({
    data: {
      userId: input.userId,
      ipsId: input.ipsId,
      content: input.content,
      kind: input.kind,
      weekNumber: input.weekNumber ?? null,
      isEscalation: input.isEscalation ?? false,
    },
  });
  return row.id;
}

export async function resolvePatientIpsId(userId: string): Promise<string | null> {
  const q = await prisma.medicalQuestionnaire.findFirst({
    where: { userId, ipsId: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { ipsId: true },
  });
  return q?.ipsId ?? null;
}
