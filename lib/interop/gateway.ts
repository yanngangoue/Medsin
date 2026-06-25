import type { Session } from "next-auth";

/**
 * Contrat « gateway » : tout appel interop passe par validation tenant + session (ou service token).
 * Une implémentation NestJS externe réutilisera la même logique via guards.
 */
export type InteropPrincipal = {
  userId: string;
  roles: string[];
  /** Province résolue depuis profil ou en-tête — doit être cohérente avec RBAC */
  province: string;
};

export function sessionToPrincipal(session: Session | null, tenantProvince: string): InteropPrincipal | null {
  if (!session?.user?.id) return null;
  const role = session.user.role;
  const roles = role ? [role] : [];
  return {
    userId: session.user.id,
    roles,
    province: tenantProvince,
  };
}

/** ABAC : règles simples MVP — étendre avec attributs ressource (urgence, mineur, etc.). */
export function canWriteMedicationRequest(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) => r === "MEDECIN" || r === "ADMIN");
}

/**
 * Returns true for roles that may read a patient record in general.
 * NOTE: PHARMACIEN is intentionally excluded — use `isPharmacien` + a runtime
 * fulfillment check in the route handler (privilege escalation fix).
 */
export function canReadPatientRecord(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) =>
    ["MEDECIN", "PATIENT", "NUTRITIONNISTE", "ADMIN"].includes(r),
  );
}

/**
 * Helper — call this in route handlers that need to allow pharmacists,
 * but only after verifying an active MedicationFulfillment for the patient.
 */
export function isPharmacien(principal: InteropPrincipal): boolean {
  return principal.roles.includes("PHARMACIEN");
}

/** Vision holistique clinique — réservée MEDECIN / ADMIN. */
export function canViewDoctorMetabolicDashboard(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) => r === "MEDECIN" || r === "ADMIN");
}

/** Vision comportementale alimentaire — réservée NUTRITIONNISTE / ADMIN. */
export function canViewNutritionistMetabolicDashboard(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) => r === "NUTRITIONNISTE" || r === "ADMIN");
}

export function canIngestOwnMetabolicData(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) => r === "PATIENT");
}

/** Opt-in Loi 25 — réservé au patient (pas d’écriture « masquée » admin en MVP). */
export function canManageDietaryConsent(principal: InteropPrincipal): boolean {
  return principal.roles.some((r) => r === "PATIENT");
}
