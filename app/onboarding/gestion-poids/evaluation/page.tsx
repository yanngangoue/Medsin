import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Glp1EligibilityWizard } from "@/components/onboarding/Glp1EligibilityWizard";
import {
  GLP1_EVALUATION_PATH,
  authEntryHref,
} from "@/lib/patient/glp1-flow-routes";

export default async function GestionPoidsEvaluationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(authEntryHref(GLP1_EVALUATION_PATH));
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

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
