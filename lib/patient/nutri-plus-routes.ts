import { ONBOARDING_SERVICES } from "@/lib/onboarding/service-routes";

export const NUTRI_PLUS_LANDING_PATH = "/onboarding/nutri-plus";
/** Page « Ce que propose Nutri+ » (CTA « Commencer ma transformation »). */
export const NUTRI_PLUS_PRODUCTS_PATH = "/onboarding/nutri-plus/produits";
/** @deprecated Utiliser NUTRI_PLUS_PRODUCTS_PATH */
export const NUTRI_PLUS_INSCRIPTION_PATH = NUTRI_PLUS_PRODUCTS_PATH;
export const NUTRI_PLUS_QUESTIONNAIRE_PATH = "/onboarding/nutri-plus/questionnaire";
export const NUTRI_PLUS_CONFIRMATION_PATH = "/onboarding/nutri-plus/confirmation";
export const NUTRI_PLUS_SERVICE = ONBOARDING_SERVICES.NUTRI_PLUS;

export const NUTRI_PLUS_INSCRIPTION_STEPS = 4;
export const NUTRI_PLUS_QUESTIONNAIRE_STEPS = 4;
