import type { ConsultationStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Statuts où une IPS peut prendre en charge un dossier non assigné. */
export const IPS_CLAIMABLE_STATUSES: ConsultationStatus[] = ["SUBMITTED", "UNDER_REVIEW"];

export function isClaimableQuestionnaireStatus(status: string): boolean {
  return IPS_CLAIMABLE_STATUSES.includes(status as ConsultationStatus);
}

export function ipsQuestionnaireListFilter(
  userId: string,
  role: Role,
  ipsPeerIds: string[] = [],
): Prisma.MedicalQuestionnaireWhereInput | Record<string, never> {
  if (role === "ADMIN" || role === "MEDECIN") {
    return {};
  }

  const or: Prisma.MedicalQuestionnaireWhereInput[] = [
    { ipsId: userId },
    { ipsId: null, status: { in: IPS_CLAIMABLE_STATUSES } },
  ];

  if (ipsPeerIds.length > 0) {
    or.push({
      ipsId: { notIn: ipsPeerIds },
      status: { in: IPS_CLAIMABLE_STATUSES },
    });
  }

  return { OR: or };
}

export async function ipsQuestionnaireListFilterForUser(
  userId: string,
  role: Role,
): Promise<Prisma.MedicalQuestionnaireWhereInput | Record<string, never>> {
  if (role === "ADMIN" || role === "MEDECIN") {
    return {};
  }
  const ipsPeerIds = await getIpsPeerIds();
  return ipsQuestionnaireListFilter(userId, role, ipsPeerIds);
}

export async function getIpsPeerIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: "IPS" },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function resolveQuestionnaireAssigneeRole(
  ipsId: string | null,
): Promise<Role | null> {
  if (!ipsId) return null;
  const user = await prisma.user.findUnique({
    where: { id: ipsId },
    select: { role: true },
  });
  return user?.role ?? null;
}

export function isQuestionnaireClaimableByIps(
  questionnaire: { ipsId: string | null; status: string },
  ipsUserId: string,
  assigneeRole: Role | null,
): boolean {
  if (questionnaire.ipsId === ipsUserId) return false;
  if (!isClaimableQuestionnaireStatus(questionnaire.status)) return false;
  if (questionnaire.ipsId === null) return true;
  return assigneeRole !== null && assigneeRole !== "IPS";
}

export function canAccessQuestionnaire(
  questionnaire: { ipsId: string | null; userId: string; status: string },
  accessor: { id: string; role: Role },
  ctx?: { assigneeRole?: Role | null },
): boolean {
  if (accessor.role === "ADMIN" || accessor.role === "MEDECIN") return true;
  if (accessor.role === "IPS") {
    if (questionnaire.ipsId === accessor.id) return true;
    return isQuestionnaireClaimableByIps(questionnaire, accessor.id, ctx?.assigneeRole ?? null);
  }
  return false;
}

/**
 * Réassigne le dossier à l'IPS de manière atomique.
 * Utilise updateMany avec conditions WHERE pour éviter la race condition
 * où deux IPS cliquent simultanément sur le même dossier non assigné.
 */
export async function claimQuestionnaireForIps(
  questionnaireId: string,
  ipsUserId: string,
): Promise<boolean> {
  // Tentative atomique : ne réussit que si ipsId est encore null
  const claimNull = await prisma.medicalQuestionnaire.updateMany({
    where: {
      id: questionnaireId,
      ipsId: null,
      status: { in: IPS_CLAIMABLE_STATUSES },
    },
    data: { ipsId: ipsUserId },
  });
  if (claimNull.count > 0) return true;

  // Lire l'état actuel pour les cas restants
  const q = await prisma.medicalQuestionnaire.findUnique({
    where: { id: questionnaireId },
    select: { ipsId: true, status: true },
  });
  if (!q) return false;
  // Déjà assigné à cette IPS
  if (q.ipsId === ipsUserId) return true;
  // Non réclamable (assigné à une IPS, mauvais statut, etc.)
  if (!q.ipsId) return false;

  // Cas : assigné à un non-IPS (médecin) — réassignation atomique
  const assigneeRole = await resolveQuestionnaireAssigneeRole(q.ipsId);
  if (assigneeRole === null || assigneeRole === "IPS") return false;

  const reassign = await prisma.medicalQuestionnaire.updateMany({
    where: {
      id: questionnaireId,
      ipsId: q.ipsId, // Vérifie que l'assigné n'a pas changé entre-temps
      status: { in: IPS_CLAIMABLE_STATUSES },
    },
    data: { ipsId: ipsUserId },
  });
  return reassign.count > 0;
}

export async function ensureIpsQuestionnaireAccess(
  questionnaire: { id: string; ipsId: string | null; userId: string; status: string },
  accessor: { id: string; role: Role },
): Promise<{ allowed: boolean; assigneeRole: Role | null }> {
  if (accessor.role !== "IPS") {
    const assigneeRole = await resolveQuestionnaireAssigneeRole(questionnaire.ipsId);
    return {
      allowed: canAccessQuestionnaire(questionnaire, accessor, { assigneeRole }),
      assigneeRole,
    };
  }

  const assigneeRole = await resolveQuestionnaireAssigneeRole(questionnaire.ipsId);
  if (isQuestionnaireClaimableByIps(questionnaire, accessor.id, assigneeRole)) {
    await claimQuestionnaireForIps(questionnaire.id, accessor.id);
    return { allowed: true, assigneeRole: "IPS" };
  }

  return {
    allowed: canAccessQuestionnaire(questionnaire, accessor, { assigneeRole }),
    assigneeRole,
  };
}
