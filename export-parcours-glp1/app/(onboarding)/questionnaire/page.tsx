import type { Metadata } from "next";
import { MedicalQuestionnaireWizard } from "@/components/onboarding/MedicalQuestionnaireWizard";

export const metadata: Metadata = {
  title: "Questionnaire médical",
  description: "Questionnaire médical MedSim — environ 5 minutes.",
};

export default function MedicalQuestionnairePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] sm:text-3xl">Questionnaire médical</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        Complétez votre dossier en 6 sections. Vos réponses sont sauvegardées automatiquement.
      </p>
      <div className="mt-8">
        <MedicalQuestionnaireWizard />
      </div>
    </div>
  );
}
