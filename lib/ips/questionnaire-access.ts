import type { Role } from "@prisma/client";

export function ipsQuestionnaireListFilter(
  userId: string,
  role: Role,
): { ipsId?: string } | Record<string, never> {
  if (role === "ADMIN" || role === "MEDECIN") {
    return {};
  }
  return { ipsId: userId };
}

export function canAccessQuestionnaire(
  questionnaire: { ipsId: string | null; userId: string },
  accessor: { id: string; role: Role },
): boolean {
  if (accessor.role === "ADMIN") return true;
  if (accessor.role === "MEDECIN") return true;
  if (accessor.role === "IPS") {
    return questionnaire.ipsId === accessor.id;
  }
  return false;
}
