import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";

/** Anonymisation irréversible du compte patient (Loi 25 — droit à l'effacement). */
export async function anonymizePatientAccount(userId: string): Promise<void> {
  const token = `deleted-${randomBytes(8).toString("hex")}`;

  await prisma.$transaction([
    prisma.chatMessage.deleteMany({
      where: { thread: { patientId: userId } },
    }),
    prisma.chatThread.deleteMany({ where: { patientId: userId } }),
    prisma.aiCoachMessage.deleteMany({ where: { userId } }),
    prisma.appNotification.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        prenom: "Utilisateur",
        name: "Supprimé",
        email: `${token}@anonymized.medsim.local`,
        passwordHash: null,
        image: null,
      },
    }),
  ]);
}
