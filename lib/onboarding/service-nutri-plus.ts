import { ONBOARDING_SERVICES } from "@/lib/onboarding/service-routes";
import {
  NUTRI_PLUS_CONFIRMATION_PATH,
  NUTRI_PLUS_LANDING_PATH,
  NUTRI_PLUS_PRODUCTS_PATH,
  NUTRI_PLUS_QUESTIONNAIRE_PATH,
} from "@/lib/patient/nutri-plus-routes";

export const NUTRI_PLUS_SERVICE_ID = ONBOARDING_SERVICES.NUTRI_PLUS;

export const NUTRI_PLUS_PATHS = {
  landing: NUTRI_PLUS_LANDING_PATH,
  catalogue: NUTRI_PLUS_PRODUCTS_PATH,
  questionnaire: NUTRI_PLUS_QUESTIONNAIRE_PATH,
  confirmation: NUTRI_PLUS_CONFIRMATION_PATH,
} as const;

export const NUTRI_PLUS_PRIMARY_CTA = "Configurer mon suivi";
