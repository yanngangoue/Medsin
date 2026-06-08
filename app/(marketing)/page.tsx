import type { Metadata } from "next";
import { auth } from "@/auth";
import { MarketingAnne } from "@/components/marketing/MarketingAnne";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingHowItWorks } from "@/components/marketing/MarketingHowItWorks";
import { MarketingMedications } from "@/components/marketing/MarketingMedications";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingPractitioners } from "@/components/marketing/MarketingPractitioners";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingProblem } from "@/components/marketing/MarketingProblem";
import { MarketingResults } from "@/components/marketing/MarketingResults";
import { MarketingServicesAvantages } from "@/components/marketing/MarketingServicesAvantages";
import { MarketingTestimonials } from "@/components/marketing/MarketingTestimonials";
import { MarketingTrustBar } from "@/components/marketing/MarketingTrustBar";
import Link from "next/link";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";

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

type Props = {
  connectedPatient?: {
    prenom: string;
  } | null;
};

function MarketingHome({ connectedPatient = null }: Props) {
  const isPatientSession = Boolean(connectedPatient);
  const prenom = connectedPatient?.prenom ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#1A1A2E]">
      {isPatientSession ? (
        <div className="border-b border-[#1D4D3A]/10 bg-white px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-[#1A1A2E]/80">
              Bonjour, <span className="font-semibold text-[#1A1A2E]">{prenom}</span>
            </p>
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="font-semibold text-[#1D4D3A] hover:underline"
            >
              Mon espace patient →
            </Link>
          </div>
        </div>
      ) : null}

      <MarketingNavbar />
      <main className="flex-1">
        <MarketingHero />
        <MarketingTrustBar />
        <MarketingProblem />
        <MarketingAnne />
        <MarketingHowItWorks />
        <MarketingResults />
        <MarketingMedications />
        <MarketingServicesAvantages />
        <MarketingPractitioners />
        <MarketingTestimonials />
        <MarketingPricing />
        <MarketingFaq />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}

export default async function MarketingHomePage() {
  const session = await auth();

  if (session?.user?.role === "PATIENT" && session.user.id) {
    return (
      <MarketingHome
        connectedPatient={{
          prenom: session.user.prenom ?? session.user.name ?? "",
        }}
      />
    );
  }

  return <MarketingHome />;
}
