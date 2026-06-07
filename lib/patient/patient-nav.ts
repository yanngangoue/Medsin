import {
  GLP1_EVALUATION_PATH,
  GLP1_PATIENT_DASHBOARD_PATH,
  GLP1_PATIENT_DOSSIER_PATH,
} from "@/lib/patient/glp1-flow-routes";
import { PATIENT_DASHBOARD_ROUTES } from "@/lib/patient/dashboard-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";

export type PatientNavItemId = "home" | "space" | "poids" | "dossier" | "contact";

export type PatientNavItem = {
  id: PatientNavItemId;
  label: string;
  href: string;
};

export function buildPatientNavItems(hasGlp1Dossier: boolean): PatientNavItem[] {
  return [
    { id: "home", label: "Accueil", href: PUBLIC_CATALOG_HOME },
    { id: "space", label: "Mon espace", href: GLP1_PATIENT_DASHBOARD_PATH },
    {
      id: "poids",
      label: "Mon suivi poids",
      href: PATIENT_DASHBOARD_ROUTES.poids,
    },
    {
      id: "dossier",
      label: hasGlp1Dossier ? "Mon dossier GLP-1" : "Évaluation GLP-1",
      href: hasGlp1Dossier ? GLP1_PATIENT_DOSSIER_PATH : GLP1_EVALUATION_PATH,
    },
    {
      id: "contact",
      label: "Contact médical",
      href: `${GLP1_PATIENT_DASHBOARD_PATH}#contact-medical`,
    },
  ];
}

export function isPatientNavActive(pathname: string, item: PatientNavItem): boolean {
  if (item.id === "home") return pathname === "/";
  if (item.id === "space") {
    return pathname === GLP1_PATIENT_DASHBOARD_PATH || pathname.startsWith("/dashboard/patient/consultation");
  }
  if (item.id === "poids") {
    return (
      pathname.startsWith(PATIENT_DASHBOARD_ROUTES.poids) ||
      pathname.startsWith(PATIENT_DASHBOARD_ROUTES.programme) ||
      pathname.startsWith(PATIENT_DASHBOARD_ROUTES.progression) ||
      pathname.startsWith(PATIENT_DASHBOARD_ROUTES.coach)
    );
  }
  if (item.id === "dossier") {
    return (
      pathname === GLP1_PATIENT_DOSSIER_PATH ||
      pathname.startsWith("/onboarding/gestion-poids") ||
      pathname.startsWith("/onboarding/confirmation")
    );
  }
  if (item.id === "contact") {
    return pathname === GLP1_PATIENT_DASHBOARD_PATH;
  }
  return false;
}
