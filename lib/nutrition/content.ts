/** Contenu statique — landing Nutri+ /nutrition */

export const NUTRI_COLORS = {
  sage: "#7CAE9E",
  cream: "#FAFAF8",
  dark: "#2D5A4E",
  muted: "#6B7280",
  pale: "#F0F7F4",
} as const;

export const INSCRIPTION_HREF = "/onboarding/inscription?service=nutri-plus";

export const TRUST_ITEMS = [
  { icon: "🌿", label: "100% naturel" },
  { icon: "👨‍⚕️", label: "Validé par des nutritionnistes" },
  { icon: "🚚", label: "Livraison au Québec" },
  { icon: "✓", label: "Sans engagement" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Votre profil",
    description:
      "Répondez à quelques questions sur votre santé et vos objectifs.",
  },
  {
    step: 2,
    title: "Notre sélection",
    description:
      "Un nutritionniste analyse votre profil et sélectionne vos compléments.",
  },
  {
    step: 3,
    title: "Livraison",
    description:
      "Vos compléments arrivent chez vous, avec un suivi personnalisé.",
  },
] as const;

export type NutritionProduct = {
  id: string;
  name: string;
  badge: string;
  description: string;
  benefits: readonly string[];
  price: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  cta: string;
};

export const NUTRITION_PRODUCTS: readonly NutritionProduct[] = [
  {
    id: "proteines",
    name: "Complexe Protéines+",
    badge: "Idéal GLP-1",
    description: "Maintien de la masse musculaire pendant la perte de poids",
    benefits: ["Masse musculaire", "Récupération", "Énergie"],
    price: "À partir de 49$/mois",
    image:
      "https://images.unsplash.com/photo-1593095948071-5c059d62a5a9?w=800&q=85&fit=crop",
    imageAlt: "Poudre de protéines blanche sur surface en bois clair",
    cta: "Ajouter à mon profil",
  },
  {
    id: "vitamines",
    name: "Vitamines Essentielles B12+D",
    badge: "Le plus populaire",
    description: "Prévention des carences fréquentes sous traitement GLP-1",
    benefits: ["Énergie", "Immunité", "Humeur"],
    price: "À partir de 29$/mois",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c7f7e2a6?w=800&q=85&fit=crop",
    imageAlt: "Capsules vitaminées sur marbre blanc lumineux",
    cta: "Ajouter à mon profil",
  },
  {
    id: "omega",
    name: "Oméga-3 Premium",
    badge: "Anti-inflammatoire",
    description: "Santé cardiovasculaire et cognitive optimisée",
    benefits: ["Cœur", "Cerveau", "Articulations"],
    price: "À partir de 39$/mois",
    image:
      "https://images.unsplash.com/photo-1505750592873-96dad0bb25ae?w=800&q=85&fit=crop",
    imageAlt: "Capsules oméga-3 sur surface bleue douce",
    cta: "Ajouter à mon profil",
  },
  {
    id: "fibres",
    name: "Fibres & Prébiotiques",
    badge: "Digestion",
    description: "Microbiome équilibré, digestion douce et satiété durable",
    benefits: ["Digestion", "Satiété", "Flore intestinale"],
    price: "À partir de 34$/mois",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=85&fit=crop",
    imageAlt: "Graines, fibres naturelles et aliments verts lumineux",
    cta: "Ajouter à mon profil",
  },
  {
    id: "magnesium",
    name: "Magnésium Glycinate",
    badge: "Anti-stress",
    description: "Sommeil, stress et récupération musculaire améliorés",
    benefits: ["Sommeil", "Stress", "Muscles"],
    price: "À partir de 24$/mois",
    image:
      "https://images.unsplash.com/photo-1550572017-edd226b742d2?w=800&q=85&fit=crop",
    imageAlt: "Gélules de magnésium sur fond vert pastel",
    cta: "Ajouter à mon profil",
  },
  {
    id: "pack",
    name: "Pack Complet Santé",
    badge: "⭐ Meilleure valeur",
    description: "Tous les essentiels réunis, tarif préférentiel",
    benefits: ["Santé globale", "Économies", "Simplifié"],
    price: "À partir de 99$/mois",
    image:
      "https://images.unsplash.com/photo-1471864190281-82d72fd2592d?w=800&q=85&fit=crop",
    imageAlt: "Assortiment de compléments sur surface naturelle claire",
    featured: true,
    cta: "Découvrir le pack",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: "marie-claude",
    name: "Marie-Claude",
    city: "Montréal",
    quote:
      "Depuis que je prends le complexe protéines recommandé par mon nutritionniste MedSim, je me sens beaucoup plus en forme pendant mon traitement GLP-1.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=85&fit=crop",
    imageAlt: "Portrait souriant, femme — Montréal",
  },
  {
    id: "jean-francois",
    name: "Jean-François",
    city: "Québec",
    quote:
      "La livraison est rapide et les compléments sont de très bonne qualité. Je recommande à tous mes proches.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=85&fit=crop",
    imageAlt: "Portrait souriant, homme — Québec",
  },
  {
    id: "sophie",
    name: "Sophie",
    city: "Laval",
    quote:
      "Simple, efficace. Mon profil est analysé et je reçois exactement ce dont j'ai besoin chaque mois.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=85&fit=crop",
    imageAlt: "Portrait souriant, femme — Laval",
  },
] as const;

export const FAQ_ITEMS = [
  {
    id: "glp1",
    question: "Les compléments sont-ils compatibles avec mon traitement GLP-1 ?",
    answer:
      "Tous nos compléments sont sélectionnés par des nutritionnistes certifiés et vérifiés pour leur compatibilité avec les traitements GLP-1.",
  },
  {
    id: "selection",
    question: "Comment sont choisis mes compléments ?",
    answer:
      "Selon votre profil de santé, vos objectifs et votre traitement actuel, notre équipe nutritionniste sélectionne les compléments les plus adaptés.",
  },
  {
    id: "cancel",
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui, sans engagement ni frais d'annulation. Vous gérez votre abonnement depuis votre espace personnel.",
  },
  {
    id: "delivery",
    question: "Livrez-vous partout au Québec ?",
    answer:
      "Oui, livraison gratuite sur toutes les commandes de plus de 50$ partout au Québec.",
  },
  {
    id: "insurance",
    question: "Est-ce remboursé par les assurances ?",
    answer:
      "Certains compléments peuvent être couverts selon votre assurance. Nous fournissons les reçus nécessaires pour vos réclamations.",
  },
] as const;

/** Hero — compléments sur surface naturelle, lumineux */
export const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1471864190281-82d72fd2592d?w=1200&q=90&fit=crop",
  alt: "Compléments alimentaires et gélules sur surface en bois clair, lumière naturelle",
} as const;
