import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export type AuditInput = {
  userId: string | null;
  action: string;
  entity?: string | null;
  ipAddress?: string | null;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  if (isDemoMode()) {
    console.info("[audit]", input.action, input.userId ?? "", input.entity ?? "");
    return;
  }
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] write failed", e);
  }
}
