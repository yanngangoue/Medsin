import { prisma } from "@/lib/prisma";

export type AuditMedicalAction =
  | "DOSSIER_OUVERT"
  | "DECISION_PRISE"
  | "ORDONNANCE_CREEE"
  | "ORDONNANCE_SIGNEE";

export async function logAuditMedical(params: {
  medecinId: string;
  patientId: string;
  action: AuditMedicalAction;
  details: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await prisma.auditMedical.create({
    data: {
      medecinId: params.medecinId,
      patientId: params.patientId,
      action: params.action,
      details: params.details as object,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}

export function requestMeta(req: Request): { ipAddress: string | null; userAgent: string | null } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip");
  return {
    ipAddress: ipAddress ?? null,
    userAgent: req.headers.get("user-agent"),
  };
}
