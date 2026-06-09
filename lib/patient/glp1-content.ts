export type Glp1Medication = {
  id: string;
  name: string;
  ingredient: string;
  form: string;
  description: string;
  highlights: readonly string[];
  image: string;
  imageAlt: string;
  localImage?: boolean;
  badge?: string;
};

export const GLP1_MEDICATIONS: readonly Glp1Medication[] = [
  {
    id: "ozempic",
    name: "Ozempic",
    ingredient: "Sémaglutide",
    form: "Injection hebdomadaire",
    description:
      "Traitement GLP-1 prescrit pour la gestion du poids et du métabolisme, avec suivi médical MedSim.",
    highlights: [
      "Réduction de l'appétit",
      "Suivi médical inclus",
      "Assistant IA proactif",
    ],
    image: "/images/glp1-ozempic-box.png",
    imageAlt: "Boîte Ozempic et stylo injectable sémaglutide",
    localImage: true,
    badge: "Le plus demandé",
  },
  {
    id: "wegovy",
    name: "Wegovy",
    ingredient: "Sémaglutide",
    form: "Injection hebdomadaire",
    description:
      "Indiqué pour la perte de poids chez les adultes en surpoids ou obèses, selon critères médicaux.",
    highlights: [
      "Posologie adaptée au poids",
      "Révision par un médecin",
      "Livraison discrète",
    ],
    image: "/images/glp1-wegovy-box.jpg",
    imageAlt: "Boîte Wegovy et stylo injectable sémaglutide pour la gestion du poids",
    localImage: true,
  },
  {
    id: "mounjaro",
    name: "Mounjaro",
    ingredient: "Tirzépatide",
    form: "Injection hebdomadaire",
    description:
      "Agit sur les récepteurs GLP-1 et GIP pour soutenir la perte de poids sous supervision médicale.",
    highlights: [
      "Double action métabolique",
      "Prescription sur évaluation",
      "Suivi personnalisé",
    ],
    image: "/images/glp1-mounjaro-pen.png",
    imageAlt: "Stylo Mounjaro KwikPen tirzépatide pour injection hebdomadaire",
    localImage: true,
    badge: "Sur prescription",
  },
] as const;

export const GLP1_BENEFITS = [
  {
    title: "Régulation de l'appétit",
    text: "Les agonistes GLP-1 aident à vous sentir rassasié plus longtemps entre les repas.",
  },
  {
    title: "Suivi médical encadré",
    text: "Chaque dossier est revu par un professionnel avant toute prescription.",
  },
  {
    title: "Accompagnement global",
    text: "Assistant IA, objectifs et assistance 24 h/24 au même endroit sur MedSim.",
  },
] as const;

export const GLP1_HERO_IMAGES = [
  {
    src: "/images/glp1-ozempic-box.png",
    alt: "Boîte Ozempic et stylo GLP-1",
    local: true as const,
    size: "h-[140px] w-[140px] sm:h-[175px] sm:w-[175px] lg:h-[195px] lg:w-[195px]",
    position: "right-[-6%] top-1/2 z-30 -translate-y-[55%]",
  },
  {
    src: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&q=85",
    alt: "Patiente souriante dans son parcours santé",
    size: "h-[100px] w-[100px] sm:h-[125px] sm:w-[125px] lg:h-[140px] lg:w-[140px]",
    position: "right-[20%] top-1/2 z-20 -translate-y-[92%]",
  },
  {
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508b1d?w=500&q=85",
    alt: "Professionnel de santé en consultation",
    size: "h-[115px] w-[115px] sm:h-[145px] sm:w-[145px] lg:h-[165px] lg:w-[165px]",
    position: "right-[-2%] top-1/2 z-40 -translate-y-[6%]",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85",
    alt: "Patient confiant dans son accompagnement",
    size: "h-[90px] w-[90px] sm:h-[110px] sm:w-[110px] lg:h-[125px] lg:w-[125px]",
    position: "right-[28%] top-1/2 z-[25] -translate-y-[2%]",
  },
] as const;
