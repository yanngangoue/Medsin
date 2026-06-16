/** Identifiants des parcours onboarding MedSim. */
export const ONBOARDING_SERVICES = {
  GLP1: "gestion-poids",
} as const;

export type OnboardingServiceId =
  (typeof ONBOARDING_SERVICES)[keyof typeof ONBOARDING_SERVICES];

export function serviceLandingPath(service: OnboardingServiceId): string {
  return `/onboarding/${service}`;
}

export function serviceInscriptionPath(service: OnboardingServiceId): string {
  return `/auth/inscription?service=${service}`;
}

export function serviceConnexionPath(
  service?: OnboardingServiceId,
  callbackUrl?: string,
): string {
  const params = new URLSearchParams();
  if (service) params.set("service", service);
  if (callbackUrl) params.set("callbackUrl", callbackUrl);
  const q = params.toString();
  return `/auth/connexion${q ? `?${q}` : ""}`;
}
