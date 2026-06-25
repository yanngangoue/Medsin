import type { Role } from "@prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  PATIENT: "/dashboard/patient",
  IPS: "/dashboard/ips",
  PHARMACIEN: "/dashboard/pharmacie",
  MEDECIN: "/medecin/file",
  NUTRITIONNISTE: "/nutritionniste",
  ADMIN: "/dashboard/admin",
};

/** Rôle requis pour accéder au préfixe de route (RBAC middleware). */
export function requiredRoleForPath(pathname: string): Role | null {
  if (pathname === "/dashboard/patient" || pathname.startsWith("/dashboard/patient/")) {
    return "PATIENT";
  }
  if (pathname === "/dashboard/ips" || pathname.startsWith("/dashboard/ips/")) {
    return "IPS";
  }
  if (pathname === "/dashboard/pharmacie" || pathname.startsWith("/dashboard/pharmacie/")) {
    return "PHARMACIEN";
  }
  if (pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")) {
    return "ADMIN";
  }
  if (pathname === "/patient" || pathname.startsWith("/patient/")) return "PATIENT";
  if (pathname === "/pharmacien" || pathname.startsWith("/pharmacien/")) return "PHARMACIEN";
  if (pathname === "/medecin" || pathname.startsWith("/medecin/")) return "MEDECIN";
  if (pathname === "/ips" || pathname.startsWith("/ips/")) return "IPS";
  if (pathname === "/nutritionniste" || pathname.startsWith("/nutritionniste/")) {
    return "NUTRITIONNISTE";
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "ADMIN";
  // Patient-only pages that require authentication
  if (pathname === "/questionnaire" || pathname.startsWith("/questionnaire/")) return "PATIENT";
  if (pathname === "/paiement" || pathname.startsWith("/paiement/")) return "PATIENT";
  return null;
}

export function defaultHomeForRole(role: Role): string {
  return ROLE_HOME[role] ?? "/dashboard/patient";
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const required = requiredRoleForPath(pathname);
  if (!required) return true;
  if (required === "IPS" && (role === "IPS" || role === "MEDECIN" || role === "ADMIN")) {
    return true;
  }
  if (required === "ADMIN" && role === "ADMIN") return true;
  return role === required;
}
