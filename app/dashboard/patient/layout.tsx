import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon espace patient — MedSim",
  description: "Suivez votre dossier GLP-1 et vos parcours de santé MedSim.",
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
