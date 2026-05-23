import type { DossierGlp1, DossierStatus, Role } from "@prisma/client";

const FILE_STATUSES: DossierStatus[] = ["EN_ATTENTE_MEDECIN", "EN_COURS_REVISION"];

/** ADMIN : tous les dossiers ; MEDECIN : non assignés ou assignés à lui. */
export function canAccessDossier(
  role: Role,
  medecinUserId: string,
  dossier: Pick<DossierGlp1, "medecinId">,
): boolean {
  if (role === "ADMIN") return true;
  if (role !== "MEDECIN") return false;
  return dossier.medecinId === null || dossier.medecinId === medecinUserId;
}

export function dossierFileWhere(medecinUserId: string, role: Role) {
  if (role === "ADMIN") {
    return { status: { in: FILE_STATUSES } };
  }
  return {
    status: { in: FILE_STATUSES },
    OR: [{ medecinId: null }, { medecinId: medecinUserId }],
  };
}
