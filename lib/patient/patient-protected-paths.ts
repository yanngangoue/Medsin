/**
 * Parcours publics (feuilletage) vs zones réservées aux patients connectés.
 */

const PUBLIC_ONBOARDING_LANDINGS = new Set([
  "/onboarding",
  "/onboarding/gestion-poids",
]);

/** Pages et APIs accessibles sans connexion (vitrine, landings). */
export function isPublicBrowsePath(pathname: string): boolean {
  return PUBLIC_ONBOARDING_LANDINGS.has(pathname);
}

/** Questionnaire, confirmation, évaluation GLP-1, espace patient, etc. */
export function requiresPatientSession(pathname: string): boolean {
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
