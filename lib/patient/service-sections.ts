import { getServiceLandingPath } from "@/lib/patient/service-landing-paths";
import {
  MEDSIM_IMG_SUIVI_CHOIX,
  MEDSIM_IMG_SUIVI_CHOIX_ALT,
  MEDSIM_IMG_SUIVI_QUESTIONNAIRE,
  MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT,
} from "@/lib/patient/nutri-plus-images";
export type PatientServiceSection = {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  sectionClassName?: string;
  accentClass?: string;
  accentTextClass?: string;
  includesTitle: string;
  bullets: readonly string[];
  productImage: string;
  productImageAlt: string;
  productFrameClass?: string;
  productCover?: boolean;
  imagePrimary: string;
  imagePrimaryAlt: string;
  imageSecondary: string;
  imageSecondaryAlt: string;
  ctaHref?: string;
};

/** Destination du bouton « En savoir plus » par service. */
export function getServiceCtaHref(sectionId: string): string {
  if (
    sectionId in {
      "gestion-poids": 1,
      "nutri-plus": 1,
      "repas-sante": 1,
    }
  ) {
    return getServiceLandingPath(sectionId);
  }
  return "/auth/inscription";
}

export const PATIENT_SERVICE_SECTIONS: readonly PatientServiceSection[] = [
  {
    id: "gestion-poids",
    title: "Une perte de poids accompagnée et adaptée à chaque patient",
    sectionClassName: "bg-[#F0F0F0] -mx-4 px-4 sm:-mx-6 sm:px-6",
    eyebrow: "Un accompagnement GLP-1 encadré par des experts",
    body:
      "Un traitement GLP-1 prescrit et un accompagnement dédié pour vous aider à atteindre des résultats durables, en toute sécurité.",
    includesTitle: "Tout ce qu'il vous faut, au même endroit :",
    bullets: [
      "Prescription pour un GLP-1 rapide et efficace",
      "Suivi médical individuel",
      "Consultations diététiques et accompagnement nutritionnel",
      "Assistance 24 h/24 et 7 j/7",
    ],
    productImage: "/images/glp1-ozempic-box.png",
    productImageAlt:
      "Boîte Ozempic et stylo injectable GLP-1 (semaglutide) pour la gestion du poids",
    productFrameClass: "aspect-[4/3] rounded-2xl bg-white shadow-sm",
    imagePrimary:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop",
    imagePrimaryAlt: "Patiente souriante sur fond clair — parcours MedSim",
    imageSecondary:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop",
    imageSecondaryAlt: "Patient souriant sur fond clair — accompagnement MedSim",
    ctaHref: "/onboarding/gestion-poids",
  },
  {
    id: "nutri-plus",
    title: "Nutri +",
    sectionClassName: "bg-[#EDE4DC] -mx-4 px-4 sm:-mx-6 sm:px-6",
    accentClass: "bg-[#6B4423]",
    accentTextClass: "text-[#6B4423]",
    eyebrow: "Nutri+ — accompagnement nutritionnel",
    body:
      "Consultation en ligne, suivi de votre alimentation au quotidien et menus adaptés — pour conserver et améliorer vos résultats obtenus avec MedSim.",
    includesTitle: "Nutri+ en un coup d'œil :",
    bullets: [
      "Mise en relation rapide avec un professionnel de santé",
      "Suivi de ce que vous mangez chaque jour",
      "Menus personnalisés selon votre profil",
      "Accompagnement pour garder vos résultats",
    ],
    ctaHref: "/onboarding/nutri-plus",
    productImage: MEDSIM_IMG_SUIVI_CHOIX,
    productImageAlt: MEDSIM_IMG_SUIVI_CHOIX_ALT,
    productFrameClass: "aspect-[4/3] rounded-2xl bg-[#F0F0F0] shadow-sm",
    productCover: true,
    imagePrimary: MEDSIM_IMG_SUIVI_CHOIX,
    imagePrimaryAlt: MEDSIM_IMG_SUIVI_CHOIX_ALT,
    imageSecondary:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop",
    imageSecondaryAlt:
      "Compléments alimentaires sur surface naturelle — Nutri+",
  },
  {
    id: "repas-sante",
    title: "Repas santé",
    sectionClassName: "bg-[#FFF4ED] -mx-4 px-4 sm:-mx-6 sm:px-6",
    accentClass: "bg-[#E8A87C]",
    accentTextClass: "text-[#D4845F]",
    eyebrow: "Repas équilibrés au quotidien",
    body:
      "Des repas pensés pour vos objectifs de santé, recommandés par nos nutritionnistes et alignés avec votre suivi, pour de meilleures habitudes au quotidien.",
    includesTitle: "Tout ce qu'il vous faut, au même endroit :",
    bullets: [
      "Repas équilibrés adaptés à vos objectifs",
      "Recommandations de nos nutritionnistes",
      "Coordination avec votre suivi médical",
      "Habitudes alimentaires durables",
    ],
    productImage:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=85",
    productImageAlt: "Assiette de repas santé coloré et équilibré",
    productFrameClass: "aspect-[4/3] rounded-2xl bg-[#FFF4ED] shadow-sm",
    productCover: true,
    imagePrimary:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
    imagePrimaryAlt: "Patients souriants autour d'un repas sain avec MedSim",
    imageSecondary:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85",
    imageSecondaryAlt: "Patiente préparant un repas équilibré avec MedSim",
    ctaHref: "/onboarding/repas-sante",
  },
];
