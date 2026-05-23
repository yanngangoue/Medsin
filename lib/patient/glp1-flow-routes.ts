export const GLP1_LANDING_PATH = "/onboarding/gestion-poids";
export const GLP1_EVALUATION_PATH = "/onboarding/gestion-poids/evaluation";
export const GLP1_CONFIRMATION_PATH = "/onboarding/confirmation?service=gestion-poids";
export const GLP1_INSCRIPTION_PATH = "/auth/inscription?service=gestion-poids";
export const GLP1_PATIENT_DASHBOARD_PATH = "/dashboard/patient";
export const GLP1_PATIENT_DOSSIER_PATH = "/dashboard/patient/dossier";
export const GLP1_PATIENT_DOSSIER_ANCHOR = "#glp-dossier";

/** Connexion puis retour vers la cible (évaluation GLP-1 par défaut). */
export function authEntryHref(targetPath: string = GLP1_EVALUATION_PATH): string {
  return `/auth/connexion?callbackUrl=${encodeURIComponent(targetPath)}`;
}

export function glp1InscriptionHref(targetPath: string = GLP1_EVALUATION_PATH): string {
  return `/auth/inscription?service=gestion-poids&callbackUrl=${encodeURIComponent(targetPath)}`;
}

/** Lien « Commencer l'évaluation » : direct si patient connecté, sinon connexion d'abord. */
export function glp1EvaluationEntryHref(isPatientSession: boolean): string {
  return isPatientSession ? GLP1_EVALUATION_PATH : authEntryHref(GLP1_EVALUATION_PATH);
}

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
