import type { EligibilityStatus } from "@prisma/client";
import {
  GLP1_EVALUATION_PATH,
  GLP1_PATIENT_DOSSIER_PATH,
} from "@/lib/patient/glp1-flow-routes";
import { getServiceSectionAnchor } from "@/lib/patient/service-landing-paths";
import { PATIENT_SERVICE_CARDS } from "@/lib/patient/services";

export type PatientHubServiceId = (typeof PATIENT_SERVICE_CARDS)[number]["id"];

export type PatientHubContext = {
  hasQuestionnaire: boolean;
  eligibility: EligibilityStatus;
  hasGlp1Dossier?: boolean;
  hasNutriPlusDossier?: boolean;
};

export type PatientHubServiceAction = {
  statusLabel: string;
  ctaLabel: string;
  href: string;
};

const ELIGIBILITY_SHORT: Record<EligibilityStatus, string> = {
  PENDING: "Dossier en analyse",
  ELIGIBLE: "Profil admissible",
  NOT_ELIGIBLE: "Revue des options",
  MEDICAL_REVIEW_REQUIRED: "Revue médicale",
};

export function getPatientHubServiceAction(
  serviceId: PatientHubServiceId,
  ctx: PatientHubContext,
): PatientHubServiceAction {
  switch (serviceId) {
    case "gestion-poids":
      if (ctx.hasGlp1Dossier) {
        return {
          statusLabel: ELIGIBILITY_SHORT[ctx.eligibility],
          ctaLabel: "Voir mon dossier GLP-1",
          href: GLP1_PATIENT_DOSSIER_PATH,
        };
      }
      return {
        statusLabel: "À commencer",
        ctaLabel: "Démarrer l'évaluation GLP-1",
        href: GLP1_EVALUATION_PATH,
      };
    case "nutri-plus":
      return {
        statusLabel: ctx.hasNutriPlusDossier ? "Actif" : "Découverte",
        ctaLabel: "Découvrir Nutri+",
        href: "/onboarding/nutri-plus",
      };
    case "repas-sante":
      return {
        statusLabel: "Commande",
        ctaLabel: "Composer ma boîte repas",
        href: "/onboarding/repas-sante",
      };
    default:
      return {
        statusLabel: "—",
        ctaLabel: "En savoir plus",
        href: "/",
      };
  }
}

export function buildPatientHubActions(ctx: PatientHubContext) {
  return PATIENT_SERVICE_CARDS.map((card) => ({
    ...card,
    discoverHref: getServiceSectionAnchor(card.id),
    action: getPatientHubServiceAction(card.id, ctx),
  }));
}

export const PUBLIC_HERO_CTAS = {
  start: { label: "Démarrer mon parcours", href: "/auth/inscription" },
  login: { label: "J'ai déjà un compte", href: "/auth/connexion?callbackUrl=/dashboard/patient" },
} as const;
