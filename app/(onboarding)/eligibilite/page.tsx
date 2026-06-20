import type { Metadata } from "next";
import { EligibilityWizard } from "@/components/onboarding/EligibilityWizard";

export const metadata: Metadata = {
  title: "Suis-je éligible ?",
  description:
    "Vérifiez votre admissibilité au programme GLP-1 Anne Santé en quelques minutes — sans compte requis.",
};

export default function EligibilitePage() {
  return (
    <div>
      <p className="text-center text-xs font-bold uppercase tracking-wider text-[#1D4D3A]">
        Étape préliminaire · 2 minutes
      </p>
      <h1 className="mt-2 text-center text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
        Suis-je éligible ?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#6B7280]">
        Répondez à 5 questions pour obtenir une première indication. Ce n&apos;est pas un avis
        médical — un professionnel confirmera votre admissibilité.
      </p>
      <div className="mx-auto mt-10 max-w-xl">
        <EligibilityWizard />
      </div>
    </div>
  );
}
