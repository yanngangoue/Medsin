import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedicalQuestionnaireWizard } from "@/components/onboarding/MedicalQuestionnaireWizard";

export const metadata: Metadata = {
  title: "Questionnaire médical",
  description: "Questionnaire médical MedSim — environ 5 minutes.",
};

export default async function MedicalQuestionnairePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(
      "/auth/inscription?service=gestion-poids&callbackUrl=%2Fquestionnaire",
    );
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] sm:text-3xl">Questionnaire médical</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        Complétez votre dossier en 6 sections. Vos réponses sont sauvegardées automatiquement toutes
        les 30 secondes.
      </p>
      <div className="mt-8">
        <MedicalQuestionnaireWizard />
      </div>
    </div>
  );
}
