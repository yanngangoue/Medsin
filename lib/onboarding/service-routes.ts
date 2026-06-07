/** Identifiants des parcours onboarding MedSim. */
export const ONBOARDING_SERVICES = {
  GLP1: "gestion-poids",
} as const;

export type OnboardingServiceId =
  (typeof ONBOARDING_SERVICES)[keyof typeof ONBOARDING_SERVICES];

export function serviceLandingPath(service: OnboardingServiceId): string {
  return "/onboarding/gestion-poids";
}

export function serviceInscriptionPath(service: OnboardingServiceId): string {
  return `/auth/inscription?service=${service}`;
}
