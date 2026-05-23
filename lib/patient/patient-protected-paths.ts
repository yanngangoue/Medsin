/**
 * Parcours publics (feuilletage) vs zones réservées aux patients connectés.
 */

const PUBLIC_ONBOARDING_LANDINGS = new Set([
  "/onboarding",
  "/onboarding/gestion-poids",
  "/onboarding/nutri-plus",
]);

const PUBLIC_NUTRI_PLUS_PREFIXES = [
  "/onboarding/nutri-plus/produits",
  "/onboarding/nutri-plus/inscription",
] as const;

/** Pages et APIs accessibles sans connexion (vitrine, landings). */
export function isPublicBrowsePath(pathname: string): boolean {
  if (PUBLIC_ONBOARDING_LANDINGS.has(pathname)) return true;
  if (PUBLIC_NUTRI_PLUS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return false;
}

/** Questionnaire, confirmation, évaluation GLP-1, espace patient, etc. */
export function requiresPatientSession(pathname: string): boolean {
  if (pathname.startsWith("/onboarding/nutri-plus/questionnaire")) return true;
  if (pathname.startsWith("/onboarding/nutri-plus/confirmation")) return true;
  if (pathname.startsWith("/onboarding/gestion-poids/evaluation")) return true;
  if (pathname.startsWith("/onboarding/confirmation")) return true;
  if (pathname.startsWith("/onboarding/questionnaire")) return true;
  if (pathname === "/onboarding/inscription") return true;

  if (pathname.startsWith("/api/onboarding/")) return true;
  if (pathname.startsWith("/api/questionnaire")) return true;
  if (pathname.startsWith("/api/appointments")) return true;
  if (pathname.startsWith("/api/patient/")) return true;
  if (pathname.startsWith("/api/messages")) return true;

  return false;
}
