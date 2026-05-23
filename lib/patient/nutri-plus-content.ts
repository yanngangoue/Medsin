import { NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS } from "@/lib/patient/nutri-plus-images";

export const MEDSIM_PLATFORM_NUTRI_DISCLAIMER =
  "Les compléments Nutri+ ne remplacent pas une alimentation variée ni un avis médical. L'accompagnement suivi & menus est proposé par MedSim.";

export const NUTRI_PLUS_HERO = {
  eyebrow: "Accompagnement nutritionnel MedSim",
  title: "Nutri+",
  subtitle: "Suivi intelligent & compléments pour vos muscles",
  titleLines: ["Nutri+.", "Suivi intelligent.", "Compléments naturels."],
  body: "Sur MedSim : configurez votre accompagnement, suivez votre alimentation, recevez des menus adaptés — et découvrez nos compléments en gélules et poudre, sélectionnés pour votre bien-être.",
} as const;

export const NUTRI_PLUS_GALLERY = {
  eyebrow: "Nos compléments",
  title: "Gélules, oméga-3, protéines & électrolytes",
  lead: "Aperçu des formats Nutri+ proposés sur la plateforme — photos soignées, choix ciblé selon votre profil. Sans repas livrés.",
} as const;

export const NUTRI_PLUS_HOW = {
  title: "Du configurateur à votre assiette : comment ça marche",
  lead:
    "Sur MedSim, vous configurez votre suivi, notez ce que vous mangez et recevez des menus adaptés — les compléments Nutri+ viennent en appui, sans repas livrés.",
} as const;

export const NUTRI_PLUS_HOW_STEPS = [
  {
    title: "Configurez sur MedSim",
    description:
      "Choisissez vos jours de suivi, vos modules Nutri+ et vos objectifs — en quelques clics.",
  },
  {
    title: "Suivez votre alimentation",
    description:
      "Tenez un journal simple de ce que vous mangez : structuré, rapide, pensé pour le quotidien.",
  },
  {
    title: "Menus & compléments",
    description:
      "Recevez des menus adaptés et, si vous le souhaitez, des compléments en gélules ou poudre alignés sur votre profil.",
  },
] as const;

export const NUTRI_PLUS_ACCOMPAGNEMENT = {
  eyebrow: "Cœur de l'offre",
  title: "Suivi & menus, pensés pour vous",
  lead: "L'essentiel de Nutri+ : comprendre votre alimentation et recevoir des repères adaptés — les compléments viennent en appui.",
  paragraphs: [
    "L'essentiel de Nutri+ : comprendre votre alimentation et recevoir des repères adaptés — les compléments viennent en appui.",
    "Configurez votre rythme sur MedSim, puis recevez des menus et des suggestions de compléments alignés sur votre profil.",
  ],
  stepsTitle: "Votre parcours en 3 étapes",
  ctaHint: "Configurez votre suivi, puis complétez votre profil Nutri+",
  closing: "Tout se fait sur MedSim — à votre rythme.",
} as const;

export const NUTRI_PLUS_COMPLEMENTS = {
  eyebrow: "En complément",
  title: "Gélules & poudre, en douceur",
  lead: "Des formats partenaires MedSim pour soutenir votre parcours — visuels soignés, choix ciblé selon votre profil.",
  cta: "Voir les formats compléments",
  note: "Optionnel — à associer à votre suivi alimentaire, pas obligatoire pour démarrer.",
} as const;

export const NUTRI_PLUS_MENU_SNAPSHOT = {
  eyebrow: "Aperçu menus",
  title: "Des idées, pas des plats à commander",
  lead: "Exemples de repères proposés dans vos menus adaptés — personnalisés après configuration.",
} as const;

export const NUTRI_PLUS_PLAN_BUILDER = {
  sectionTitle: "Configurer mon accompagnement",
  sectionLead:
    "Un suivi sur mesure, sur MedSim. Choisissez vos jours, vos modules et vos objectifs ici.",
  openCta: "Configurer mon suivi",
  trackingLabel: "Jours de suivi alimentaire par semaine",
  daysLabel: "Jours à suivre dans la semaine",
  modulesTitle: "Modules Nutri+",
  modulesHint: "Sélectionnez au moins deux modules (journal et menus recommandés).",
  followupTitle: "Objectif de suivi pour chaque jour",
  sidebarTitle: "Votre plan Nutri+",
  sidebarSubtitle: "Aperçu — personnalisé selon votre profil",
  modulesLine: "Modules activés",
  trackingLine: "Jours de suivi",
  startCta: "Démarrer mon accompagnement Nutri+",
  completeHint: "Associez un objectif de suivi à chaque jour",
} as const;

export const NUTRI_PLUS_GALLERY_BULLETS = [
  "Gélules et poudres sélectionnées selon votre profil",
  "Suivi alimentaire structuré sur MedSim",
  "Menus adaptés — sans repas livrés",
  "Compléments pour soutenir la masse musculaire",
] as const;

export const NUTRI_PLUS_BENEFITS = [
  {
    title: "Suivi quotidien",
    detail: "Journal alimentaire simple pour garder le cap.",
  },
  {
    title: "Menus personnalisés",
    detail: "Repères nutritionnels adaptés à vos objectifs.",
  },
  {
    title: "Compléments ciblés",
    detail: "Protéines et nutriments pour limiter la perte musculaire.",
  },
] as const;

export const NUTRI_PLUS_INSCRIPTION_STEPS = [
  { label: "Identité", hint: "Votre nom et prénom" },
  { label: "Courriel", hint: "Adresse de connexion" },
  { label: "Mot de passe", hint: "Sécurisez votre compte" },
  { label: "Confirmation", hint: "Vérifiez vos informations" },
] as const;

/** Compatibilité anciens composants */
export const NUTRI_PLUS_POSITIONING = NUTRI_PLUS_ACCOMPAGNEMENT;
export const NUTRI_PLUS_OFFER = NUTRI_PLUS_ACCOMPAGNEMENT;
export const NUTRI_PLUS_SERVICE_PILLARS = NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS.map((p) => ({
  id: p.id,
  title: p.title,
  detail: p.text,
  label: p.title,
}));
export const NUTRI_PLUS_TRUST_PILLARS = [
  { label: "Suivi", detail: "Journal & check-ins" },
  { label: "Menus", detail: "Repères adaptés" },
  { label: "Muscles", detail: "Compléments protéinés" },
  { label: "MedSim", detail: "Tout au même endroit" },
] as const;
export const NUTRI_PLUS_STATS = [
  { value: "3", label: "modules Nutri+" },
  { value: "7", label: "jours de suivi max." },
  { value: "100%", label: "sur MedSim" },
] as const;
export const NUTRI_PLUS_ACCOMPAGNEMENT_DARK = NUTRI_PLUS_ACCOMPAGNEMENT;
