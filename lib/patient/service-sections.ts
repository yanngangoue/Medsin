import { getServiceLandingPath } from "@/lib/patient/service-landing-paths";

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
  if (sectionId === "gestion-poids") {
    return getServiceLandingPath(sectionId);
  }
  return "/auth/inscription";
}

export const PATIENT_SERVICE_SECTIONS: readonly PatientServiceSection[] = [
  {
    id: "gestion-poids",
    title: "Une perte de poids accompagnée et adaptée à chaque patient",
    eyebrow: "Un accompagnement GLP-1 encadré par des experts",
    accentTextClass: "text-white/80",
    body:
      "Un traitement GLP-1 prescrit, un suivi médical dédié et un assistant IA proactif pour vous aider à atteindre des résultats durables, en toute sécurité.",
    includesTitle: "Tout ce qu'il vous faut, au même endroit :",
    bullets: [
      "Prescription pour un GLP-1 rapide et efficace",
      "Suivi médical individuel",
      "Assistant IA Claude — suivi proactif au quotidien",
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
];
