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

/** Réassigne le dossier à l'IPS si elle peut le prendre en charge (non assigné ou assigné à un non-IPS). */
export async function claimQuestionnaireForIps(
  questionnaireId: string,
  ipsUserId: string,
): Promise<boolean> {
  const questionnaire = await prisma.medicalQuestionnaire.findUnique({
    where: { id: questionnaireId },
    select: { ipsId: true, status: true },
  });
  if (!questionnaire) return false;

  const assigneeRole = await resolveQuestionnaireAssigneeRole(questionnaire.ipsId);
  if (!isQuestionnaireClaimableByIps(questionnaire, ipsUserId, assigneeRole)) {
    return questionnaire.ipsId === ipsUserId;
  }

  await prisma.medicalQuestionnaire.update({
    where: { id: questionnaireId },
    data: { ipsId: ipsUserId },
  });
  return true;
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
