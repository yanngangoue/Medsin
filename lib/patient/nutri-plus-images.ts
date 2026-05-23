/** Visuels Nutri+ — compléments (photos locales) + suivi MedSim. */

export const NUTRI_PLUS_IMG_CAPSULES = "/images/nutri-plus-gelules.jpg";
export const NUTRI_PLUS_IMG_CAPSULES_ALT =
  "Gélules et comprimés de compléments alimentaires — Nutri+";

/** Carte accueil & vitrine — protéines / maintien de la masse musculaire */
export const NUTRI_PLUS_IMG_MUSCLE =
  "https://images.unsplash.com/photo-1579722820303-d74dc79bb709?w=640&q=85";
export const NUTRI_PLUS_IMG_MUSCLE_ALT =
  "Poudre de protéines et complément pour nourrir les muscles et limiter la perte musculaire — Nutri+";

export const NUTRI_PLUS_IMG_CAPSULES_HERO = "/images/nutri-plus-gelules-hero.jpg";
export const NUTRI_PLUS_IMG_CAPSULES_HERO_ALT =
  "Gélules colorées de compléments alimentaires en gros plan";

export const NUTRI_PLUS_IMG_POWDER = "/images/nutri-plus-poudre.jpg";
export const NUTRI_PLUS_IMG_POWDER_ALT =
  "Poudre de protéines et complément avec doseur — Nutri+";

export const NUTRI_PLUS_IMG_VITAMINES = "/images/nutri-plus-vitamines.jpg";
export const NUTRI_PLUS_IMG_VITAMINES_ALT =
  "Flacons vitamines et compléments sur fond naturel — Nutri+";

export const NUTRI_PLUS_SHOWCASE_PRODUCTS = [
  {
    id: "capsules",
    label: "Gélules",
    tagline: "Comprimés & gélules, format quotidien",
    src: NUTRI_PLUS_IMG_CAPSULES_HERO,
    alt: NUTRI_PLUS_IMG_CAPSULES_HERO_ALT,
  },
  {
    id: "powder",
    label: "Poudre",
    tagline: "Protéines & poudre avec doseur",
    src: NUTRI_PLUS_IMG_POWDER,
    alt: NUTRI_PLUS_IMG_POWDER_ALT,
  },
] as const;

/** Collage hero type Repas — 5 cercles compléments */
export const NUTRI_PLUS_HERO_PLATES = [
  {
    src: "/images/nutri-hero-1.jpg",
    alt: "Compléments en gélules sur fond clair",
    size: "h-[150px] w-[150px] sm:h-[185px] sm:w-[185px] lg:h-[210px] lg:w-[210px]",
    position: "right-[-8%] top-1/2 z-30 -translate-y-[58%]",
  },
  {
    src: "/images/nutri-hero-2.jpg",
    alt: "Flacon oméga et compléments minéraux",
    size: "h-[95px] w-[95px] sm:h-[120px] sm:w-[120px] lg:h-[135px] lg:w-[135px]",
    position: "right-[18%] top-1/2 z-20 -translate-y-[95%]",
  },
  {
    src: "/images/nutri-hero-3.jpg",
    alt: "Poudre protéinée avec doseur",
    size: "h-[130px] w-[130px] sm:h-[165px] sm:w-[165px] lg:h-[185px] lg:w-[185px]",
    position: "right-[-4%] top-1/2 z-40 -translate-y-[8%]",
  },
  {
    src: "/images/nutri-hero-4.jpg",
    alt: "Smoothie vert nutrition",
    size: "h-[105px] w-[105px] sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px]",
    position: "right-[26%] top-1/2 z-[25] -translate-y-[5%]",
  },
  {
    src: "/images/nutri-hero-5.jpg",
    alt: "Vitamines et super-aliments",
    size: "h-[85px] w-[85px] sm:h-[105px] sm:w-[105px] lg:h-[120px] lg:w-[120px]",
    position: "right-[38%] top-1/2 z-10 -translate-y-[42%]",
  },
] as const;

/** @deprecated Utiliser NUTRI_PLUS_HERO_PLATES */
export const NUTRI_PLUS_HERO_FLOATS = NUTRI_PLUS_HERO_PLATES;

export const MEDSIM_IMG_SUIVI_CHOIX = "/images/medsim-suivi-01-choix.jpg";
export const MEDSIM_IMG_SUIVI_CHOIX_ALT = "Configuration du suivi nutritionnel MedSim";

export const MEDSIM_IMG_SUIVI_QUESTIONNAIRE = "/images/medsim-suivi-02-questionnaire.jpg";
export const MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT =
  "Journal alimentaire — patient note ses repas sur MedSim";

export const MEDSIM_IMG_SUIVI_VALIDATION = "/images/medsim-suivi-03-validation.jpg";
export const MEDSIM_IMG_SUIVI_VALIDATION_ALT =
  "Menus adaptés validés par un nutritionniste MedSim";

export const NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS = [
  {
    id: "journal",
    title: "Journal alimentaire",
    text: "Notez vos repas et collations — un suivi simple pour garder le cap, jour après jour.",
    src: MEDSIM_IMG_SUIVI_QUESTIONNAIRE,
    alt: MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT,
    accent: "from-[#E8F5F0] to-white",
  },
  {
    id: "menus",
    title: "Menus adaptés",
    text: "Des repères personnalisés selon votre profil, pour consolider vos résultats en douceur.",
    src: MEDSIM_IMG_SUIVI_VALIDATION,
    alt: MEDSIM_IMG_SUIVI_VALIDATION_ALT,
    accent: "from-[#F5F0EB] to-white",
  },
  {
    id: "config",
    title: "Votre rythme",
    text: "Choisissez vos jours de suivi et vos objectifs — Nutri+ s'adapte à votre quotidien.",
    src: MEDSIM_IMG_SUIVI_CHOIX,
    alt: MEDSIM_IMG_SUIVI_CHOIX_ALT,
    accent: "from-[#F0F7F4] to-white",
  },
] as const;

export const NUTRI_PLUS_SERVICE_SHOWCASE = NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS.map((p) => ({
  ...p,
  label: p.title,
}));

export const MEDSIM_SUIVI_STEPS = [
  {
    id: "config",
    step: "01",
    title: "Configurez votre suivi",
    caption: "Sur MedSim",
    description: "Choisissez vos jours et modules Nutri+ adaptés à votre profil.",
    src: MEDSIM_IMG_SUIVI_CHOIX,
    alt: MEDSIM_IMG_SUIVI_CHOIX_ALT,
  },
  {
    id: "suivi",
    step: "02",
    title: "Suivi alimentaire",
    caption: "Ce que vous mangez, chaque jour",
    description: "Un journal simple pour suivre vos repas — structuré et rapide.",
    src: MEDSIM_IMG_SUIVI_QUESTIONNAIRE,
    alt: MEDSIM_IMG_SUIVI_QUESTIONNAIRE_ALT,
  },
  {
    id: "menus",
    step: "03",
    title: "Menus adaptés",
    caption: "Personnalisés pour vous",
    description: "Des repères nutritionnels pour garder le cap sur vos résultats.",
    src: MEDSIM_IMG_SUIVI_VALIDATION,
    alt: MEDSIM_IMG_SUIVI_VALIDATION_ALT,
  },
] as const;
