/** Routes du tableau de bord patient (programme poids + coach IA). */
export const PATIENT_DASHBOARD_ROUTES = {
  hub: "/dashboard/patient",
  poids: "/dashboard/patient/poids",
  /** Legacy — redirigent vers /poids?tab=… */
  programme: "/dashboard/patient/programme",
  progression: "/dashboard/patient/progression",
  coach: "/dashboard/patient/coach",
  ordonnance: "/dashboard/patient/ordonnance",
  clavardage: "/dashboard/patient/clavardage",
  confidentialite: "/dashboard/patient/confidentialite",
  dossier: "/dashboard/patient/dossier",
} as const;

export type PoidsTab = "programme" | "progression" | "coach";

export function parsePoidsTab(value: string | null): PoidsTab {
  if (value === "progression" || value === "coach") return value;
  return "programme";
}

export function poidsTabHref(tab: PoidsTab): string {
  return `${PATIENT_DASHBOARD_ROUTES.poids}?tab=${tab}`;
}

export const POIDS_TABS: { id: PoidsTab; label: string }[] = [
  { id: "programme", label: "Programme" },
  { id: "progression", label: "Progression" },
  { id: "coach", label: "Anne" },
];

export const PATIENT_DASHBOARD_SECTIONS = [
  {
    id: "programme" as const,
    href: poidsTabHref("programme"),
    title: "Mon programme",
    description: "Objectifs, check-ins et configuration",
    icon: "◎",
  },
  {
    id: "progression" as const,
    href: poidsTabHref("progression"),
    title: "Progression",
    description: "Courbes, tendances et historique",
    icon: "↗",
  },
  {
    id: "coach" as const,
    href: poidsTabHref("coach"),
    title: "Anne",
    description: "Votre coach santé IA — accompagnement proactif",
    icon: "✦",
  },
  {
    id: "clavardage" as const,
    href: PATIENT_DASHBOARD_ROUTES.clavardage,
    title: "Clavardage",
    description: "Anne et votre IPS — messagerie sécurisée",
    icon: "💬",
  },
  {
    id: "ordonnance" as const,
    href: PATIENT_DASHBOARD_ROUTES.ordonnance,
    title: "Ma prescription",
    description: "Suivi de livraison en temps réel",
    icon: "📦",
  },
];
