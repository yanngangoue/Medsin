/** Rôles professionnels créables uniquement par l'administrateur. */
export const ADMIN_INVITABLE_ROLES = ["IPS", "MEDECIN", "PHARMACIEN"] as const;

export type AdminInvitableRole = (typeof ADMIN_INVITABLE_ROLES)[number];

export function isAdminInvitableRole(value: string): value is AdminInvitableRole {
  return (ADMIN_INVITABLE_ROLES as readonly string[]).includes(value);
}

export function staffRoleLabel(role: AdminInvitableRole): string {
  switch (role) {
    case "IPS":
      return "Infirmière praticienne spécialisée (IPS)";
    case "MEDECIN":
      return "Médecin";
    case "PHARMACIEN":
      return "Pharmacien partenaire";
  }
}

export function staffRoleHome(role: AdminInvitableRole): string {
  switch (role) {
    case "IPS":
      return "/dashboard/ips";
    case "MEDECIN":
      return "/medecin/file";
    case "PHARMACIEN":
      return "/dashboard/pharmacie";
  }
}

export function staffRoleShortLabel(role: AdminInvitableRole): string {
  switch (role) {
    case "IPS":
      return "IPS";
    case "MEDECIN":
      return "Médecin";
    case "PHARMACIEN":
      return "Pharmacie";
  }
}
