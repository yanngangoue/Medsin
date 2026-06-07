/** Pages vitrine de chaque parcours. */
export const SERVICE_LANDING_PATHS = {
  "gestion-poids": "/onboarding/gestion-poids",
} as const;

/** Sections détaillées sur l’accueil (scroll depuis les cartes du bandeau). */
export const SERVICE_SECTION_ANCHORS = {
  "gestion-poids": "#gestion-poids",
} as const;

export type ServiceLandingId = keyof typeof SERVICE_LANDING_PATHS;

export function getServiceLandingPath(serviceId: string): string {
  return (
    SERVICE_LANDING_PATHS[serviceId as ServiceLandingId] ??
    SERVICE_LANDING_PATHS["gestion-poids"]
  );
}

export function getServiceSectionAnchor(serviceId: string): string {
  return (
    SERVICE_SECTION_ANCHORS[serviceId as ServiceLandingId] ??
    SERVICE_SECTION_ANCHORS["gestion-poids"]
  );
}

/** Lien vers une section de l’accueil depuis n’importe quelle page. */
export function getServiceSectionHref(
  serviceId: string,
  homePath = "/",
): string {
  const anchor = getServiceSectionAnchor(serviceId);
  return homePath === "/" ? anchor : `${homePath.replace(/\/$/, "")}${anchor}`;
}
