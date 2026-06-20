export type Glp1TreatmentCard = {
  id: string;
  panelClass: string;
  image: string;
  imageAlt: string;
  localImage?: boolean;
  /** Style image : produit (contain) ou portrait (cover doux). */
  variant: "product" | "lifestyle";
  title: string;
  description: string;
};

/** Cartes type MEDVi — visuels distincts, fonds pastel doux. */
export const GLP1_TREATMENT_CARDS: readonly Glp1TreatmentCard[] = [
  {
    id: "ozempic",
    panelClass: "bg-[#E8F5F0]",
    image: "/images/glp1-ozempic-box.png",
    imageAlt: "Boîte et stylo Ozempic sémaglutide",
    localImage: true,
    variant: "product",
    title: "Injection Ozempic®",
    description: "Sémaglutide · une injection par semaine.",
  },
  {
    id: "wegovy",
    panelClass: "bg-[#FAF6F1]",
    image: "/images/glp1-wegovy-box.jpg",
    imageAlt: "Boîte Wegovy sémaglutide pour la gestion du poids",
    localImage: true,
    variant: "product",
    title: "Wegovy®",
    description: "Perte de poids chez l'adulte en surpoids ou obèse.",
  },
  {
    id: "accompagnement",
    panelClass: "bg-[#F0F7FC]",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80&fit=crop",
    imageAlt: "Patiente souriante, accompagnée dans son parcours santé",
    variant: "lifestyle",
    title: "Suivi Anne-sante",
    description: "Nutrition, objectifs et assistance 24 h/24.",
  },
  {
    id: "mounjaro",
    panelClass: "bg-[#EEF2F6]",
    image: "/images/glp1-mounjaro-pen.png",
    imageAlt: "Stylo Mounjaro KwikPen tirzépatide",
    localImage: true,
    variant: "product",
    title: "Injection Mounjaro®",
    description: "Tirzépatide · double action GLP-1 et GIP.",
  },
] as const;

export const GLP1_SCIENCE_STATS = [
  { value: "6×", label: "Plus efficace qu'un régime seul" },
  { value: "18%", label: "Perte de poids corporelle moyenne" },
  { value: "93%", label: "Maintien des résultats à long terme" },
] as const;
