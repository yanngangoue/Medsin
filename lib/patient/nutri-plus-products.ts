/** Ce que propose Nutri+ — compléments gélules & poudre uniquement. */

import {
  NUTRI_PLUS_IMG_CAPSULES,
  NUTRI_PLUS_IMG_CAPSULES_ALT,
  NUTRI_PLUS_IMG_POWDER,
  NUTRI_PLUS_IMG_POWDER_ALT,
} from "@/lib/patient/nutri-plus-images";

export type NutriPlusOfferingFormat = "Poudre" | "Gélules";

export type NutriPlusOffering = {
  id: string;
  title: string;
  description: string;
  format: NutriPlusOfferingFormat;
  detail?: string;
  image: string;
  imageAlt: string;
  panelClass: string;
};

export const NUTRI_PLUS_OFFERINGS: readonly NutriPlusOffering[] = [
  {
    id: "capsules",
    title: "Compléments en gélules",
    format: "Gélules",
    description:
      "Boîte de gélules et compléments alimentaires partenaires : vitamines, oméga-3, minéraux et formats pratiques au quotidien.",
    detail: "Nutri+ · format gélules",
    image: NUTRI_PLUS_IMG_CAPSULES,
    imageAlt: NUTRI_PLUS_IMG_CAPSULES_ALT,
    panelClass: "bg-[#EDE4DC]",
  },
  {
    id: "powder",
    title: "Compléments en poudre",
    format: "Poudre",
    description:
      "Compléments en poudre avec doseur : protéines, fibres et nutrition ciblée selon votre profil Nutri+.",
    detail: "Nutri+ · format poudre",
    image: NUTRI_PLUS_IMG_POWDER,
    imageAlt: NUTRI_PLUS_IMG_POWDER_ALT,
    panelClass: "bg-[#EDE4DC]",
  },
] as const;
