/** Galerie compléments Nutri+ — fichiers locaux public/images (libellé = visuel). */

export type NutriComplementItem = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

export const NUTRI_COMPLEMENTS: readonly NutriComplementItem[] = [
  {
    id: "gelules-vert",
    label: "Gélules naturelles",
    src: "/images/nutri-cpl-01.jpg",
    alt: "Gélules et compléments alimentaires naturels",
  },
  {
    id: "omega",
    label: "Oméga-3",
    src: "/images/nutri-cpl-02.jpg",
    alt: "Capsules oméga-3 — huile de poisson",
  },
  {
    id: "proteines",
    label: "Poudre protéinée",
    src: "/images/nutri-cpl-03.jpg",
    alt: "Poudre de protéines avec doseur",
  },
  {
    id: "electrolytes",
    label: "Électrolytes",
    src: "/images/nutri-cpl-04.jpg",
    alt: "Boisson hydratante aux électrolytes — citron",
  },
  {
    id: "vitamines",
    label: "Complexe vitamines",
    src: "/images/nutri-cpl-05.jpg",
    alt: "Vitamines et compléments en gélules",
  },
  {
    id: "comprimes",
    label: "Comprimés quotidiens",
    src: "/images/nutri-cpl-06.jpg",
    alt: "Comprimés et gélules pour une prise quotidienne",
  },
  {
    id: "superfood",
    label: "Super-aliments",
    src: "/images/nutri-cpl-07.jpg",
    alt: "Super-aliments verts et graines",
  },
  {
    id: "flacons",
    label: "Flacons partenaires",
    src: "/images/nutri-cpl-08.jpg",
    alt: "Poudre de protéines et compléments en pot",
  },
] as const;

export const complementById = Object.fromEntries(
  NUTRI_COMPLEMENTS.map((c) => [c.id, c]),
) as Record<string, NutriComplementItem>;
