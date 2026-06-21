/**
 * Marque produit visible — plateforme GLP-1 Anne-sante.
 * Les identifiants techniques (MEDSIM_*, @medsim.ca) restent inchangés.
 */
export const APP_BRAND = {
  name: "Anne-sante",
  slug: "anne-sante",
  /** Coach IA intégré — prénom distinct de la marque plateforme */
  coachName: "Anne",
  supportEmail: "support@anne-sante.ca",
  privacyEmail: "confidentialite@anne-sante.ca",
  color: "#1D9E75",
  colorOnDark: "#FFFFFF",
  logo: {
    default: "/brand/anne-sante-logo.svg",
    onDark: "/brand/anne-sante-logo-white.svg",
  },
  docs: {
    default: "public/brand/anne-sante-logo.svg",
    onDark: "public/brand/anne-sante-logo-white.svg",
  },
} as const;

/** Alias compatibilité — préférer APP_BRAND dans le nouveau code */
export const MEDSIM_BRAND = APP_BRAND;
