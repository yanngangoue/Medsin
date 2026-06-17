import { prisma } from "@/lib/prisma";

/** Assigne le premier IPS actif disponible (round-robin simple par charge). */
export async function assignIpsToQuestionnaire(questionnaireId: string): Promise<string | null> {
  const ipsUsers = await prisma.user.findMany({
    where: { role: "IPS" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (ipsUsers.length === 0) {
    return null;
  }

  const counts = await prisma.medicalQuestionnaire.groupBy({
    by: ["ipsId"],
    where: {
      ipsId: { in: ipsUsers.map((u) => u.id) },
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
    },
    _count: { id: true },
  });

  const load = new Map(counts.map((c) => [c.ipsId, c._count.id]));
  const chosen = ipsUsers.reduce((best, u) => {
    const c = load.get(u.id) ?? 0;
    const bestC = load.get(best.id) ?? 0;
    return c < bestC ? u : best;
  });

  await prisma.medicalQuestionnaire.update({
    where: { id: questionnaireId },
    data: { ipsId: chosen.id },
  });

  return chosen.id;
}
