import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon espace patient — MedSim",
  description:
    "Programme de gestion du poids, progression, Anne (coach santé IA) et dossier GLP-1 — MedSim.",
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
