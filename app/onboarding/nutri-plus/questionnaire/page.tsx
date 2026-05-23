import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NutriPlusQuestionnaireWizard } from "@/components/onboarding/NutriPlusQuestionnaireWizard";
import { NUTRI_PLUS_QUESTIONNAIRE_PATH } from "@/lib/patient/nutri-plus-routes";

export default async function NutriPlusQuestionnairePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/auth/connexion?callbackUrl=${encodeURIComponent(NUTRI_PLUS_QUESTIONNAIRE_PATH)}`,
    );
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center bg-[#F5F0EB] text-sm text-slate-500">
          Chargement du questionnaire…
        </div>
      }
    >
      <NutriPlusQuestionnaireWizard />
    </Suspense>
  );
}
