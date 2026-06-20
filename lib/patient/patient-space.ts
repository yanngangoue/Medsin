import type { EligibilityStatus } from "@prisma/client";

export type PatientJourneyStep = {
  id: string;
  label: string;
  state: "done" | "current" | "upcoming";
};

export type PatientStatusTheme = {
  accent: string;
  accentSoft: string;
  ring: string;
  icon: string;
};

export function patientStatusTheme(status: EligibilityStatus): PatientStatusTheme {
  switch (status) {
    case "ELIGIBLE":
      return {
        accent: "#1D9E75",
        accentSoft: "#F0FBF7",
        ring: "ring-emerald-200/80",
        icon: "✓",
      };
    case "NOT_ELIGIBLE":
      return {
        accent: "#64748b",
        accentSoft: "#F8FAFC",
        ring: "ring-slate-200",
        icon: "○",
      };
    case "MEDICAL_REVIEW_REQUIRED":
      return {
        accent: "#D97706",
        accentSoft: "#FFFBEB",
        ring: "ring-amber-200/80",
        icon: "◷",
      };
    default:
      return {
        accent: "#3B82F6",
        accentSoft: "#EFF6FF",
        ring: "ring-blue-200/80",
        icon: "…",
      };
  }
}

export function patientStatusHeadline(status: EligibilityStatus): {
  title: string;
  subtitle: string;
} {
  switch (status) {
    case "ELIGIBLE":
      return {
        title: "Bonne nouvelle pour votre dossier",
        subtitle:
          "Votre profil correspond aux critères de simulation GLP-1. Un médecin Anne-sante confirmera sous 24 à 48 h.",
      };
    case "NOT_ELIGIBLE":
      return {
        title: "Parcours GLP-1 non retenu en simulation",
        subtitle:
          "Un professionnel peut réévaluer votre situation ou vous orienter vers un autre parcours de soins.",
      };
    case "MEDICAL_REVIEW_REQUIRED":
      return {
        title: "Votre dossier est entre les mains d'un médecin",
        subtitle:
          "Revue médicale en cours. Vous recevrez une mise à jour si des précisions sont nécessaires.",
      };
    default:
      return {
        title: "Dossier reçu — analyse en cours",
        subtitle: "Votre évaluation a bien été enregistrée. Statut mis à jour après examen.",
      };
  }
}

export function buildPatientJourneySimple(
  hasGlp1Dossier: boolean,
  eligibility: EligibilityStatus,
): PatientJourneyStep[] {
  if (!hasGlp1Dossier) {
    return [
      { id: "eval", label: "Évaluation", state: "current" },
      { id: "account", label: "Compte", state: "done" },
      { id: "review", label: "Revue", state: "upcoming" },
      { id: "next", label: "Suite", state: "upcoming" },
    ];
  }

  const step3Label =
    eligibility === "NOT_ELIGIBLE"
      ? "Résultat"
      : eligibility === "ELIGIBLE"
        ? "Confirmé"
        : "Revue méd.";

  const step3State: PatientJourneyStep["state"] =
    eligibility === "ELIGIBLE" || eligibility === "NOT_ELIGIBLE" ? "current" : "current";

  const step4State: PatientJourneyStep["state"] =
    eligibility === "ELIGIBLE" || eligibility === "NOT_ELIGIBLE" ? "current" : "upcoming";

  return [
    { id: "eval", label: "Évaluation", state: "done" },
    { id: "account", label: "Compte", state: "done" },
    { id: "review", label: step3Label, state: step3State },
    { id: "next", label: "Prochaine étape", state: step4State },
  ];
}
