import type { Role } from "@prisma/client";
import { isStaffRole } from "@/lib/session";

export const ROLE_HOME: Record<Role, string> = {
  PATIENT: "/dashboard/patient",
  PHARMACIEN: "/pharmacien",
  MEDECIN: "/admin/dashboard",
  NUTRITIONNISTE: "/nutritionniste",
  ADMIN: "/admin/dashboard",
};

/** Rôle requis pour accéder au préfixe de route (RBAC middleware). */
export function requiredRoleForPath(pathname: string): Role | null {
  if (pathname === "/dashboard/patient" || pathname.startsWith("/dashboard/patient/")) {
    return "PATIENT";
  }
  if (pathname.startsWith("/patient/")) return "PATIENT";
  if (pathname === "/pharmacien" || pathname.startsWith("/pharmacien/")) return "PHARMACIEN";
  if (pathname === "/medecin" || pathname.startsWith("/medecin/")) return "MEDECIN";
  if (pathname === "/nutritionniste" || pathname.startsWith("/nutritionniste/")) return "NUTRITIONNISTE";
  if (pathname.startsWith("/admin")) return null;
  return null;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function canAccessAdminPath(role: Role): boolean {
  return isStaffRole(role);
}

export function defaultHomeForRole(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (isAdminPath(pathname)) return canAccessAdminPath(role);
  const required = requiredRoleForPath(pathname);
  if (!required) return true;
  return role === required;
}
