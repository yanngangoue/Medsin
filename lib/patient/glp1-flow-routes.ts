export const GLP1_LANDING_PATH = "/onboarding/gestion-poids";
export const GLP1_EVALUATION_PATH = "/onboarding/gestion-poids/evaluation";
export const GLP1_CONFIRMATION_PATH = "/onboarding/confirmation?service=gestion-poids";
export const GLP1_INSCRIPTION_PATH = "/auth/inscription?service=gestion-poids";
export const GLP1_PATIENT_DASHBOARD_PATH = "/dashboard/patient";
export const GLP1_PATIENT_DOSSIER_PATH = "/dashboard/patient/dossier";
export const GLP1_PATIENT_DOSSIER_ANCHOR = "#glp-dossier";

/** Depuis l'espace patient : dossier existant → page dossier, sinon → questionnaire. */
export function glp1PatientNavHref(hasGlp1Dossier: boolean): string {
  if (hasGlp1Dossier) return GLP1_PATIENT_DOSSIER_PATH;
  return GLP1_EVALUATION_PATH;
}

/** Carte service « Gestion du poids » dans l'espace patient (pas la landing publique). */
export function glp1PatientServiceHref(hasGlp1Dossier: boolean): string {
  if (hasGlp1Dossier) return GLP1_PATIENT_DOSSIER_PATH;
  return GLP1_EVALUATION_PATH;
}
