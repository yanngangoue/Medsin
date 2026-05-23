/** Identifiants des parcours onboarding MedSim. */
export const ONBOARDING_SERVICES = {
  GLP1: "gestion-poids",
  NUTRI_PLUS: "nutri-plus",
  REPAS_SANTE: "repas-sante",
} as const;

export type OnboardingServiceId =
  (typeof ONBOARDING_SERVICES)[keyof typeof ONBOARDING_SERVICES];

export function serviceLandingPath(service: OnboardingServiceId): string {
  switch (service) {
    case ONBOARDING_SERVICES.GLP1:
      return "/onboarding/gestion-poids";
    case ONBOARDING_SERVICES.NUTRI_PLUS:
      return "/onboarding/nutri-plus";
    case ONBOARDING_SERVICES.REPAS_SANTE:
      return "/onboarding/repas-sante";
    default:
      return "/";
  }
}

export function serviceInscriptionPath(service: OnboardingServiceId): string {
  switch (service) {
    case ONBOARDING_SERVICES.NUTRI_PLUS:
      return "/onboarding/nutri-plus";
    case ONBOARDING_SERVICES.REPAS_SANTE:
      return "/onboarding/repas-sante";
    default:
      return `/auth/inscription?service=${service}`;
  }
}
