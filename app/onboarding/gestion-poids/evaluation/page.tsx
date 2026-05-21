import { Suspense } from "react";
import { Glp1EligibilityWizard } from "@/components/onboarding/Glp1EligibilityWizard";

export default function GestionPoidsEvaluationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
          Chargement du questionnaire…
        </div>
      }
    >
      <Glp1EligibilityWizard />
    </Suspense>
  );
}
