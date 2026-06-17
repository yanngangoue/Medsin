import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedicalQuestionnaireWizard } from "@/components/onboarding/MedicalQuestionnaireWizard";
import {
  ONBOARDING_SERVICES,
  serviceConnexionPath,
} from "@/lib/onboarding/service-routes";

export const metadata: Metadata = {
  title: "Questionnaire médical",
  description: "Questionnaire médical MedSim — environ 5 minutes.",
};

export default async function MedicalQuestionnairePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(serviceConnexionPath(ONBOARDING_SERVICES.GLP1, "/questionnaire"));
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  return (
    <div className="mt-4">
      <MedicalQuestionnaireWizard />
    </div>
  );
}
