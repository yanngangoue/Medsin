export type IpsGender = "f" | "m";

export type IpsShowcaseProfile = {
  id: string;
  name: string;
  gender: IpsGender;
  city: string;
  years: number;
  specialty: string;
  quote: string;
  photo: string;
  photoAlt: string;
  tags: readonly string[];
};

export function ipsPractitionerTitle(gender: IpsGender): string {
  return gender === "m"
    ? "Infirmier praticien spécialisé"
    : "Infirmière praticienne spécialisée";
}

export function ipsCertifiedLabel(gender: IpsGender): string {
  return gender === "m" ? "IPS certifié" : "IPS certifiée";
}

/** IPS MedSim — portraits et spécialités (données vitrine). */
export const IPS_SHOWCASE_PROFILES: readonly IpsShowcaseProfile[] = [
  {
    id: "mc",
    name: "Marie-Claude F.",
    gender: "f",
    city: "Québec",
    years: 12,
    specialty: "Gestion du poids · GLP-1",
    quote:
      "Chaque dossier mérite une écoute attentive. Mon rôle : sécuriser le traitement et ajuster le suivi selon vos réponses.",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=85&fit=crop",
    photoAlt: "Marie-Claude F., IPS souriante en blouse clinique",
    tags: ["GLP-1", "Télémédecine", "Québec"],
  },
  {
    id: "sb",
    name: "Sophie B.",
    gender: "f",
    city: "Montréal",
    years: 8,
    specialty: "Obésité · diabète de type 2",
    quote:
      "Le GLP-1 change la vie de beaucoup de patients. Je veille à ce que chaque étape soit comprise et encadrée.",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=85&fit=crop",
    photoAlt: "Sophie B., IPS professionnelle et accueillante",
    tags: ["Obésité", "Diabète T2", "Montréal"],
  },
  {
    id: "at",
    name: "Amélie T.",
    gender: "f",
    city: "Laval",
    years: 6,
    specialty: "Soins de première ligne",
    quote:
      "Disponible, claire et humaine : c'est ainsi que j'aborde chaque consultation en ligne avec mes patients.",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=85&fit=crop",
    photoAlt: "Amélie T., IPS souriante prête à accompagner",
    tags: ["Prévention", "Réponse rapide", "Laval"],
  },
  {
    id: "cl",
    name: "Catherine L.",
    gender: "f",
    city: "Sherbrooke",
    years: 10,
    specialty: "Endocrinologie communautaire",
    quote:
      "Prescrire, c'est une chose. Suivre les effets, l'adhésion et le moral, c'est tout le parcours MedSim.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=85&fit=crop",
    photoAlt: "Catherine L., IPS confiante en milieu clinique",
    tags: ["Endocrino", "Suivi continu", "Estrie"],
  },
  {
    id: "ir",
    name: "Isaac R.",
    gender: "m",
    city: "Gatineau",
    years: 9,
    specialty: "Perte de poids médicale",
    quote:
      "Les patients ont souvent des questions sur les nausées ou la dose. Je suis là pour répondre sans jugement.",
    photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=85&fit=crop",
    photoAlt: "Isaac R., IPS à l'écoute de ses patients",
    tags: ["GLP-1", "Effets secondaires", "Outaouais"],
  },
  {
    id: "vd",
    name: "Véronique D.",
    gender: "f",
    city: "Trois-Rivières",
    years: 7,
    specialty: "Télémédecine · soins adultes",
    quote:
      "Le parcours en ligne doit rester humain. Je prends le temps d'expliquer chaque décision clinique.",
    photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=85&fit=crop",
    photoAlt: "Véronique D., IPS souriante en consultation virtuelle",
    tags: ["Télémédecine", "Adultes", "Mauricie"],
  },
] as const;
