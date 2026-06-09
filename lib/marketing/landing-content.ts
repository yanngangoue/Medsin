import { COACH_NAME } from "@/lib/coach-brand";

export const MARKETING_COLORS = {
  primary: "#1D4D3A",
  accent: "#3EBD93",
  background: "#FAFAF8",
  coachBg: "#F0F7F4",
  text: "#1A1A2E",
} as const;

export const NAV_LINKS = [
  { id: "medicaments", label: "Médicaments" },
  { id: "comment-ca-marche", label: "Comment ça marche" },
  { id: "tarifs", label: "Tarifs" },
  { id: "faq", label: "FAQ" },
] as const;

export const ELIGIBILITY_PATH = "/eligibilite";

export const TRUST_ITEMS = [
  { icon: "🩺", label: "IPS certifiées Québec" },
  { icon: "💊", label: "GLP-1 sur ordonnance" },
  { icon: "🤖", label: `${COACH_NAME} — coach IA incluse` },
  { icon: "🚚", label: "Livraison gratuite" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    icon: "1️⃣",
    title: "Éligibilité (2 min)",
    description: "Cinq questions rapides pour savoir si le GLP-1 vous convient — gratuit, sans compte.",
    exclusive: false,
  },
  {
    number: 2,
    icon: "2️⃣",
    title: "Dossier médical (5 min)",
    description: "Questionnaire médical sécurisé et création de compte pour soumettre votre dossier.",
    exclusive: false,
  },
  {
    number: 3,
    icon: "3️⃣",
    title: "Ordonnance IPS (moins de 48 h)",
    description: "Une infirmière praticienne spécialisée examine votre dossier et prescrit si approprié.",
    exclusive: false,
  },
  {
    number: 4,
    icon: "4️⃣",
    title: "Livraison + suivi IA",
    description:
      `Médicament livré chez vous. ${COACH_NAME} vous accompagne chaque semaine — proactivement.`,
    exclusive: true,
  },
] as const;

export const AI_COACH_BENEFITS = [
  "Analyse vos tendances poids, énergie, sommeil",
  "Messages proactifs après chaque bilan hebdomadaire",
  "Disponible 24 h/24 entre vos rendez-vous médicaux",
  "Alertes intelligentes si quelque chose sort de la normale",
  "Parle français canadien, comprend votre contexte",
] as const;

export const AI_COACH_CHAT = [
  {
    role: "assistant" as const,
    content:
      `Bonjour Marie, c'est ${COACH_NAME} ! Vous avez perdu 1,2 kg cette semaine — excellent progrès. J'ai analysé vos données : votre énergie est stable mais votre sommeil a baissé. Je vous suggère d'ajuster votre dose d'hydratation le soir.`,
  },
  {
    role: "user" as const,
    content: "Merci ! Et pour les effets secondaires de cette semaine ?",
  },
  {
    role: "assistant" as const,
    content:
      "Rien d'alarmant. Les légères nausées que vous mentionnez sont normales en semaine 3. Voici 3 ajustements alimentaires simples qui aident…",
  },
] as const;

export const RESULT_STATS = [
  { value: "−15 %", label: "Poids moyen à 6 mois" },
  { value: "Moins de 48 h", label: "Délai ordonnance IPS" },
  { value: "24 h/24", label: `${COACH_NAME} disponible` },
] as const;

export const TESTIMONIALS = [
  {
    name: "Marie T.",
    city: "Montréal, QC",
    weightLoss: "−14 kg",
    quote: "Anne m'a tenu motivée entre les rendez-vous. Rien de comparable chez les autres cliniques.",
  },
  {
    name: "Jean-Philippe D.",
    city: "Québec, QC",
    weightLoss: "−11 kg",
    quote: "Livraison discrète, équipe médicale réactive. Le suivi visuel est vraiment bien fait.",
  },
  {
    name: "Catherine L.",
    city: "Laval, QC",
    weightLoss: "−9 kg",
    quote: "J'apprécie qu'Anne m'écrive en premier après mes pesées. Ça change tout au quotidien.",
  },
] as const;

export const MARKETING_MEDICATIONS = [
  {
    id: "ozempic",
    name: "Ozempic",
    ingredient: "Sémaglutide",
    description:
      "Agoniste GLP-1 prescrit pour la gestion du poids et du métabolisme, avec titration médicale.",
    priceFrom: 149,
    image: "/images/glp1-ozempic-box.png",
    imageAlt: "Boîte Ozempic sémaglutide",
  },
  {
    id: "wegovy",
    name: "Wegovy",
    ingredient: "Sémaglutide",
    description:
      "Formulation dédiée à la perte de poids chez les adultes admissibles, selon critères médicaux.",
    priceFrom: 149,
    image: "/images/glp1-wegovy-box.jpg",
    imageAlt: "Boîte Wegovy sémaglutide",
  },
  {
    id: "apo-semaglutide",
    name: "Apo-Sémaglutide",
    ingredient: "Sémaglutide générique",
    description:
      "Option économique de sémaglutide, prescrite par votre IPS si cliniquement appropriée.",
    priceFrom: 99,
    image: null,
    imageAlt: "Apo-Sémaglutide sur ordonnance",
  },
] as const;

export const PRICING_PLAN = {
  name: "Programme GLP-1 Complet",
  price: 149,
  period: "mois",
  features: [
    "Médicament (Ozempic ou Wegovy)",
    "Consultation médicale",
    `${COACH_NAME} — coach santé IA illimité`,
    "Livraison gratuite",
    "Suivi et ajustements de dose",
  ],
  note: "Annulable en tout temps · Aucun engagement",
} as const;

export const FAQ_ITEMS = [
  {
    q: "Est-ce que je suis admissible ?",
    a: "L'admissibilité dépend de votre IMC, antécédents médicaux et critères cliniques. Complétez l'évaluation gratuite en ligne : un médecin MedSim analysera votre dossier sous 24 h.",
  },
  {
    q: "Combien de temps avant de voir des résultats ?",
    a: "La plupart des patients constatent une réduction de l'appétit dès les premières semaines. Une perte de poids significative apparaît généralement entre le 1er et le 3e mois, selon le protocole prescrit.",
  },
  {
    q: `Qui est ${COACH_NAME} ?`,
    a: `${COACH_NAME} est votre coach santé IA. Elle analyse vos bilans hebdomadaires (poids, énergie, sommeil) et vous contacte de façon proactive. Elle motive et informe — sans jamais remplacer votre IPS.`,
  },
  {
    q: "Est-ce couvert par mon assurance ?",
    a: "La couverture varie selon votre régime privé ou provincial. Nous pouvons vous fournir les documents nécessaires pour une demande de remboursement auprès de votre assureur.",
  },
  {
    q: "Quelle est la différence avec Felix Health ?",
    a: `Felix n'offre pas de coach IA proactif comme ${COACH_NAME}, qui analyse vos données et vous écrit en premier. MedSim combine prescription médicale, tableau de bord visuel et accompagnement ${COACH_NAME} 24 h/24 — au même prix tout inclus, avec une interface moderne pensée pour le Québec.`,
  },
  {
    q: "Comment annuler ?",
    a: "Vous pouvez annuler votre abonnement en tout temps depuis votre espace patient ou en contactant notre équipe. Aucun frais de résiliation.",
  },
  {
    q: "Mes données sont-elles protégées (Loi 25) ?",
    a: "Oui. Données médicales chiffrées, journal d'audit des accès, export et suppression depuis votre espace. Voir notre politique de confidentialité.",
  },
  {
    q: "Puis-je parler à mon IPS en tout temps ?",
    a: `Oui, via le clavardage sécurisé. Votre IPS répond généralement en moins de 24 h. ${COACH_NAME} est disponible 24 h/24. En urgence : 811 ou 911.`,
  },
] as const;
