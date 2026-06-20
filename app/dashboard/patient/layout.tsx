import type { Metadata } from "next";
import { PortalSectionBoundary } from "@/components/layout/PortalSectionBoundary";

export const metadata: Metadata = {
  title: "Mon espace patient — Anne-sante",
  description:
    "Programme de gestion du poids, progression, Anne (coach santé IA) et dossier GLP-1 — Anne-sante.",
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalSectionBoundary title="Impossible d'afficher cette section de votre espace patient.">
      {children}
    </PortalSectionBoundary>
  );
}
