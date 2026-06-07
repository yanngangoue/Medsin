import type { Role } from "@prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  PATIENT: "/dashboard/patient",
  IPS: "/dashboard/ips",
  PHARMACIEN: "/pharmacien",
  MEDECIN: "/medecin",
  NUTRITIONNISTE: "/nutritionniste",
  ADMIN: "/admin",
};

/** Rôle requis pour accéder au préfixe de route (RBAC middleware). */
export function requiredRoleForPath(pathname: string): Role | null {
  if (pathname === "/patient" || pathname.startsWith("/patient/")) return "PATIENT";
  if (pathname === "/pharmacien" || pathname.startsWith("/pharmacien/")) return "PHARMACIEN";
  if (pathname === "/medecin" || pathname.startsWith("/medecin/")) return "MEDECIN";
  if (pathname === "/ips" || pathname.startsWith("/ips/")) return "IPS";
  if (pathname === "/nutritionniste" || pathname.startsWith("/nutritionniste/")) return "NUTRITIONNISTE";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "ADMIN";
  return null;
}

export function defaultHomeForRole(role: Role): string {
  return ROLE_HOME[role] ?? "/patient";
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const required = requiredRoleForPath(pathname);
  if (!required) return true;
  return role === required;
}
