/**
 * Marque produit visible — plateforme GLP-1 (ex-Anne Santé).
 * Les identifiants techniques (MEDSIM_*, @medsim.ca, medsim-logo.svg) restent inchangés.
 */
export const APP_BRAND = {
  name: "Anne Santé",
  /** Coach IA intégré — prénom distinct de la marque plateforme */
  coachName: "Anne",
  color: "#1D9E75",
  colorOnDark: "#FFFFFF",
  logo: {
    default: "/brand/medsim-logo.svg",
    onDark: "/brand/medsim-logo-white.svg",
  },
  docs: {
    default: "docs/logo/medsim-logo.svg",
    onDark: "docs/logo/medsim-logo-white.svg",
  },
} as const;

/** Alias compatibilité — préférer APP_BRAND dans le nouveau code */
export const MEDSIM_BRAND = APP_BRAND;
