import {
  NUTRI_PLUS_IMG_CAPSULES,
  NUTRI_PLUS_IMG_CAPSULES_ALT,
  NUTRI_PLUS_IMG_POWDER,
  NUTRI_PLUS_IMG_POWDER_ALT,
} from "@/lib/patient/nutri-plus-images";

export type NutriPlusShowcaseCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  panelClass: string;
};

export const NUTRI_PLUS_SHOWCASE_CARDS: readonly NutriPlusShowcaseCard[] = [
  {
    id: "capsules",
    title: "Compléments en gélules",
    description: "Boîte de gélules et compléments alimentaires partenaires Nutri+.",
    image: NUTRI_PLUS_IMG_CAPSULES,
    imageAlt: NUTRI_PLUS_IMG_CAPSULES_ALT,
    panelClass: "bg-[#EDE4DC]",
  },
  {
    id: "powder",
    title: "Compléments en poudre",
    description: "Poudre avec doseur — protéines, fibres et formats ciblés.",
    image: NUTRI_PLUS_IMG_POWDER,
    imageAlt: NUTRI_PLUS_IMG_POWDER_ALT,
    panelClass: "bg-[#EDE4DC]",
  },
] as const;
