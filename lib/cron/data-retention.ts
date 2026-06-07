import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

const CHAT_RETENTION_YEARS = 2;

export type DataRetentionResult = {
  chatMessagesDeleted: number;
};

/** Purge des messages de clavardage > 2 ans (logs médicaux conservés 7 ans ailleurs). */
export async function runDataRetention(): Promise<DataRetentionResult> {
  if (isDemoMode()) {
    return { chatMessagesDeleted: 0 };
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - CHAT_RETENTION_YEARS);

  const result = await prisma.chatMessage.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return { chatMessagesDeleted: result.count };
}
