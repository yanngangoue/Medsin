export type NutriPlusAnswers = {
  primaryGoal: string;
  activityLevel: string;
  supplementExperience: string;
  dietaryConstraints: string[];
  energyFocus: string;
  monthlyBudget: string;
  coachPreference: string;
  notes: string;
};

export const NUTRI_GOAL_OPTIONS = [
  { id: "energy", label: "Plus d'énergie au quotidien" },
  { id: "composition", label: "Améliorer ma composition corporelle" },
  { id: "habits", label: "Structurer mes habitudes alimentaires" },
  { id: "performance", label: "Soutenir ma performance sportive" },
] as const;

export const NUTRI_ACTIVITY_OPTIONS = [
  { id: "sedentary", label: "Sédentaire" },
  { id: "light", label: "Légèrement actif (1–2× / semaine)" },
  { id: "moderate", label: "Modérément actif (3–4× / semaine)" },
  { id: "active", label: "Très actif (5×+ / semaine)" },
] as const;

export const NUTRI_SUPPLEMENT_OPTIONS = [
  { id: "none", label: "Jamais pris de compléments" },
  { id: "occasional", label: "Occasionnellement" },
  { id: "regular", label: "Régulièrement" },
] as const;

export const NUTRI_CONSTRAINT_OPTIONS = [
  { id: "vegetarian", label: "Végétarien" },
  { id: "lactose", label: "Sans lactose" },
  { id: "gluten", label: "Sans gluten" },
  { id: "none", label: "Aucune restriction particulière" },
] as const;

export const NUTRI_ENERGY_OPTIONS = [
  { id: "morning", label: "Fatigue surtout le matin" },
  { id: "afternoon", label: "Coup de barre l'après-midi" },
  { id: "stable", label: "Énergie globalement stable" },
  { id: "variable", label: "Énergie très variable" },
] as const;

export const NUTRI_BUDGET_OPTIONS = [
  { id: "under75", label: "Moins de 75 $ / mois" },
  { id: "75-125", label: "75 à 125 $ / mois" },
  { id: "125plus", label: "Plus de 125 $ / mois" },
] as const;

export const NUTRI_COACH_OPTIONS = [
  { id: "digital", label: "Suivi numérique (messages + espace patient)" },
  { id: "call", label: "Préférer un échange avec un professionnel" },
  { id: "self", label: "Autonome avec ressources guidées" },
] as const;

export const NUTRI_PLUS_STORAGE_KEY = "medsim_nutri_plus_answers_v1";

export const EMPTY_NUTRI_ANSWERS: NutriPlusAnswers = {
  primaryGoal: "",
  activityLevel: "",
  supplementExperience: "",
  dietaryConstraints: [],
  energyFocus: "",
  monthlyBudget: "",
  coachPreference: "",
  notes: "",
};
