import { prisma } from "@/lib/prisma";

export async function auditMedicalRecordAccess(input: {
  accessorId: string;
  patientId: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.accessorId,
        action: "medical_record_access",
        entity: input.patientId,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        ipAddress: input.ipAddress ?? null,
        metadata: { patientId: input.patientId },
      },
    });
  } catch (e) {
    console.error("[audit-medical]", e);
  }
}
