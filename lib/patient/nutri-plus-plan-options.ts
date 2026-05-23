/** Options du configurateur Nutri+ — suivi & menus (pas de consultation). */

export type NutriPlanModule = {
  id: string;
  label: string;
  detail: string;
};

export type NutriDayFollowup = {
  id: string;
  label: string;
  detail: string;
};

export const NUTRI_PLAN_MODULES: readonly NutriPlanModule[] = [
  {
    id: "journal",
    label: "Journal alimentaire",
    detail: "Indiquez ce que vous mangez chaque jour — simple et structuré",
  },
  {
    id: "menus",
    label: "Menus adaptés",
    detail: "Repères et menus personnalisés selon votre profil",
  },
  {
    id: "suivi-pro",
    label: "Suivi & ajustements",
    detail: "Retours de nos nutritionnistes pour garder le cap",
  },
] as const;

export const NUTRI_DAY_FOLLOWUPS: readonly NutriDayFollowup[] = [
  {
    id: "journal",
    label: "Journal du jour",
    detail: "Enregistrer vos repas et collations",
  },
  {
    id: "menu",
    label: "Menu adapté",
    detail: "Repères nutritionnels pour la journée",
  },
  {
    id: "checkin",
    label: "Check-in guidé",
    detail: "Questions courtes pour ajuster votre semaine",
  },
  {
    id: "consolidation",
    label: "Consolidation",
    detail: "Maintenir et améliorer vos résultats MedSim",
  },
] as const;

export const moduleById = Object.fromEntries(
  NUTRI_PLAN_MODULES.map((m) => [m.id, m]),
) as Record<string, NutriPlanModule>;

export const followupById = Object.fromEntries(
  NUTRI_DAY_FOLLOWUPS.map((f) => [f.id, f]),
) as Record<string, NutriDayFollowup>;

export const DEFAULT_MODULE_IDS = ["journal", "menus"] as const;
