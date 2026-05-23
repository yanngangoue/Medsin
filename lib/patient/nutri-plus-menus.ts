/** Aperçu menus Nutri+ — bento léger (4 visuels), pas grille type Repas. */

export type NutriMenuPreview = {
  id: string;
  label: string;
  src: string;
  alt: string;
  span?: "tall" | "wide";
};

export const NUTRI_MENU_SNAPSHOTS: readonly NutriMenuPreview[] = [
  {
    id: "petit-dej",
    label: "Petit-déjeuner équilibré",
    src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    alt: "Petit-déjeuner équilibré",
    span: "tall",
  },
  {
    id: "dejeuner",
    label: "Déjeuner protéiné",
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    alt: "Bol déjeuner protéiné",
  },
  {
    id: "diner",
    label: "Dîner léger",
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    alt: "Dîner léger aux légumes",
    span: "wide",
  },
  {
    id: "collation",
    label: "Collation intelligente",
    src: "https://images.unsplash.com/photo-1498837167922-ddd275ead614?w=600&q=80",
    alt: "Collation fruits et noix",
  },
] as const;
