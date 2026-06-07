/** Carte projet sur `/` uniquement si MEDSIM_SHOW_PROJECT_HUB=true (désactivé par défaut). */
export function isDevProjectHubHome(): boolean {
  return process.env.MEDSIM_SHOW_PROJECT_HUB === "true";
}

export type ProjectMapLink = {
  href: string;
  label: string;
  note?: string;
};

export type ProjectMapSection = {
  title: string;
  description?: string;
  links: ProjectMapLink[];
};

export const PROJECT_MAP_SECTIONS: ProjectMapSection[] = [
  {
    title: "Accueil & parcours public",
    links: [
      { href: "/landing", label: "Landing marketing" },
      { href: "/onboarding", label: "Onboarding — choix parcours" },
      { href: "/onboarding/gestion-poids", label: "Gestion du poids (GLP-1)" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Connexion & inscription",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/onboarding/inscription", label: "Inscription (onboarding)" },
      { href: "/connexion/mot-de-passe-oublie", label: "Mot de passe oublié" },
      { href: "/auth/inscription", label: "Inscription (auth legacy)" },
    ],
  },
  {
    title: "Espaces par rôle (après connexion)",
    links: [
      { href: "/patient", label: "Patient", note: "rôle PATIENT" },
      { href: "/medecin", label: "Médecin", note: "rôle MEDECIN" },
      { href: "/medecin/patients", label: "Médecin — patients" },
      { href: "/medecin/file", label: "Médecin — file d’attente" },
      { href: "/medecin/ordonnances", label: "Médecin — ordonnances" },
      { href: "/medecin/agenda", label: "Médecin — agenda" },
      { href: "/medecin/messages", label: "Médecin — messages" },
      { href: "/pharmacien", label: "Pharmacien", note: "rôle PHARMACIEN" },
      { href: "/admin", label: "Admin", note: "rôle ADMIN" },
      { href: "/admin/dashboard", label: "Admin — tableau de bord" },
      { href: "/admin/patients", label: "Admin — patients" },
      { href: "/admin/messages", label: "Admin — messages" },
      { href: "/admin/settings", label: "Admin — paramètres" },
      { href: "/acces-refuse", label: "Accès refusé" },
    ],
  },
  {
    title: "Patient — dossier & téléconsultation",
    links: [
      { href: "/dashboard/patient", label: "Dashboard patient (hub)" },
      { href: "/dashboard/patient/programme", label: "Programme poids" },
      { href: "/dashboard/patient/progression", label: "Progression & courbes" },
      { href: "/dashboard/patient/coach", label: "Coach IA Claude" },
      { href: "/dashboard/patient/dossier", label: "Dossier GLP-1" },
      { href: "/appointments", label: "Rendez-vous" },
      { href: "/onboarding/questionnaire", label: "Questionnaire" },
      { href: "/onboarding/confirmation", label: "Confirmation onboarding" },
    ],
  },
  {
    title: "Interopérabilité & métabolisme",
    description: "API FHIR + données métaboliques (consentement requis pour ingestion).",
    links: [
      { href: "/dev/interop-test", label: "Page de test interop (boutons)", note: "PATIENT connecté" },
      { href: "/api/interop/v1/metabolic/consent/dietary", label: "API — consentement", note: "POST" },
      { href: "/api/interop/v1/metabolic/intake/glp1", label: "API — GLP-1", note: "POST" },
      { href: "/projet", label: "Cette carte (raccourci /projet)" },
    ],
  },
  {
    title: "Pages légales",
    links: [
      { href: "/confidentialite", label: "Politique de confidentialité" },
      { href: "/conditions-utilisation", label: "Conditions d’utilisation" },
      { href: "/politique-remboursement", label: "Politique de remboursement" },
      { href: "/conformite", label: "Conformité" },
      { href: "/garantie", label: "Garantie" },
    ],
  },
];
