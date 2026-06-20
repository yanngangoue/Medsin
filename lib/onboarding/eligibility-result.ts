import type { EligibilityStatus } from "@prisma/client";
import { computeBmi } from "@/lib/eligibility";
import type { EligibilityDraft } from "@/lib/onboarding/eligibility-session";

export type EligibilityOutcome = "eligible" | "not_eligible" | "borderline";

export type EligibilityResult = {
  outcome: EligibilityOutcome;
  status: EligibilityStatus;
  bmi: number;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function evaluateEligibility(draft: EligibilityDraft): EligibilityResult {
  const bmi = draft.bmi > 0 ? draft.bmi : computeBmi(draft.weightKg, draft.heightCm);

  if (draft.hasThyroidOrPancreatitis || draft.isPregnantOrNursing) {
    return {
      outcome: "not_eligible",
      status: "NOT_ELIGIBLE",
      bmi,
      title: "Ce traitement n'est pas indiqué pour vous en ce moment",
      message:
        "D'après vos réponses, le GLP-1 n'est pas recommandé sans avis médical approfondi. Nous vous encourageons à consulter votre médecin ou le 811 pour un suivi adapté.",
      ctaLabel: "Retour à l'accueil",
      ctaHref: "/",
    };
  }

  if (draft.age < 18) {
    return {
      outcome: "not_eligible",
      status: "NOT_ELIGIBLE",
      bmi,
      title: "Âge minimum requis",
      message: "Le programme Anne-sante s'adresse aux adultes de 18 ans et plus.",
      ctaHref: "/",
    };
  }

  const lowBmi = bmi > 0 && bmi < 27;
  const borderlineDiabetes = draft.hasDiabetes === "unknown";

  if (lowBmi || borderlineDiabetes) {
    return {
      outcome: "borderline",
      status: "MEDICAL_REVIEW_REQUIRED",
      bmi,
      title: "Nous allons évaluer votre dossier",
      message:
        lowBmi && borderlineDiabetes
          ? "Votre IMC est sous le seuil habituel et certaines réponses nécessitent une revue clinique. Un professionnel Anne-sante vous contactera."
          : lowBmi
            ? "Le traitement GLP-1 est généralement recommandé pour un IMC ≥ 27. Nous pouvons quand même évaluer votre dossier avec notre équipe."
            : "Un professionnel examinera votre dossier pour confirmer la pertinence du traitement.",
      ctaLabel: "Commencer mon évaluation médicale →",
      ctaHref: "/auth/inscription?service=gestion-poids&callbackUrl=%2Fquestionnaire",
    };
  }

  return {
    outcome: "eligible",
    status: "ELIGIBLE",
    bmi,
    title: "Bonne nouvelle — vous semblez admissible",
    message:
      "Vos réponses indiquent qu'un parcours GLP-1 pourrait vous convenir. Poursuivez avec le questionnaire médical complet (environ 5 minutes).",
    ctaLabel: "Commencer mon évaluation médicale →",
    ctaHref: "/auth/inscription?service=gestion-poids&callbackUrl=%2Fquestionnaire",
  };
}
