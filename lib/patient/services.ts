import { SERVICE_SECTION_ANCHORS } from "@/lib/patient/service-landing-paths";

const NUTRI_PLUS_CARD_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop";

export const PATIENT_SERVICE_CARDS = [
  {
    id: "gestion-poids",
    title: "Gestion du poids",
    subtitle: "GLP-1, suivi médical et objectifs personnalisés",
    href: SERVICE_SECTION_ANCHORS["gestion-poids"],
    image: "https://images.unsplash.com/photo-1745939921744-ba8ef27940bf?w=640&q=80",
    imageAlt: "Stylo injectable GLP-1 pour la gestion du poids, sur ordonnance",
    panelClass: "bg-[#e8f5f0]",
  },
  {
    id: "nutri-plus",
    title: "Nutri +",
    subtitle: "Suivi alimentaire, compléments muscles & menus adaptés",
    href: SERVICE_SECTION_ANCHORS["nutri-plus"],
    image: NUTRI_PLUS_CARD_IMAGE,
    imageAlt:
      "Compléments alimentaires en gélules et protéines pour nourrir les muscles — Nutri+",
    panelClass: "bg-[#eef6fc]",
  },
  {
    id: "repas-sante",
    title: "Repas santé",
    subtitle: "Repas équilibrés livrés ou guidés par nos nutritionnistes",
    href: SERVICE_SECTION_ANCHORS["repas-sante"],
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&q=80",
    imageAlt: "Assiette de repas santé coloré et équilibré",
    panelClass: "bg-[#faf3ee]",
  },
] as const;
