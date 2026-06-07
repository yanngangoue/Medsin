import type { Metadata } from "next";
import { auth } from "@/auth";
import { MedsimLanding } from "@/components/marketing/MedsimLanding";

export const metadata: Metadata = {
  title: "MedSim — Perte de poids GLP-1 avec Anne au Québec et au Canada",
  description:
    "Prescription de sémaglutide en ligne, livraison discrète et Anne, coach santé IA proactive. Évaluation médicale gratuite. À partir de 149 $/mois tout inclus.",
  openGraph: {
    title: "MedSim — GLP-1 + Anne, coach santé IA",
    description:
      "Surpassez les cliniques en ligne classiques : suivi médical, Ozempic/Wegovy et accompagnement IA proactif.",
    locale: "fr_CA",
    type: "website",
  },
};

export default async function MarketingHomePage() {
  const session = await auth();

  if (session?.user?.role === "PATIENT" && session.user.id) {
    return (
      <MedsimLanding
        connectedPatient={{
          prenom: session.user.prenom ?? session.user.name ?? "",
        }}
      />
    );
  }

  return <MedsimLanding />;
}
