import Link from "next/link";
import { MarketingAiCoach } from "@/components/marketing/MarketingAiCoach";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingHowItWorks } from "@/components/marketing/MarketingHowItWorks";
import { MarketingMedications } from "@/components/marketing/MarketingMedications";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingResults } from "@/components/marketing/MarketingResults";
import { MarketingTrustBar } from "@/components/marketing/MarketingTrustBar";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";

type Props = {
  connectedPatient?: {
    prenom: string;
  } | null;
};

export function MedsimLanding({ connectedPatient = null }: Props) {
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

      <MarketingNavbar isPatientSession={isPatientSession} />
      <main className="flex-1">
        <MarketingHero isPatientSession={isPatientSession} />
        <MarketingTrustBar />
        <MarketingHowItWorks />
        <MarketingAiCoach />
        <MarketingResults />
        <MarketingMedications isPatientSession={isPatientSession} />
        <MarketingPricing isPatientSession={isPatientSession} />
        <MarketingFaq />
        <MarketingCta isPatientSession={isPatientSession} />
      </main>
      <MarketingFooter />
    </div>
  );
}
