import type { EligibilityStatus } from "@prisma/client";
import { isDemoMode } from "@/lib/is-demo-mode";
import { getGlp1DossierForUser, hasGlp1Dossier } from "@/lib/patient/glp1-dossier";
import type { PatientHubContext } from "@/lib/patient/patient-hub";
import { prisma } from "@/lib/prisma";

export async function loadPatientHubContext(userId: string): Promise<PatientHubContext> {
  let eligibility: EligibilityStatus = "PENDING";
  let hasQuestionnaire = false;
  let hasGlp1 = false;

  if (!isDemoMode()) {
    const [profile, questionnaire, dossier] = await Promise.all([
      prisma.patientProfile.findUnique({ where: { userId } }),
      prisma.questionnaire.findUnique({ where: { userId } }),
      getGlp1DossierForUser(userId),
    ]);

    hasQuestionnaire = Boolean(questionnaire);
    if (profile) {
      eligibility = profile.eligibility;
      hasGlp1 = hasGlp1Dossier(profile.healthInfo);
    }
    if (dossier.submitted && dossier.summary) {
      hasGlp1 = true;
      eligibility = dossier.summary.eligibility;
    }
  }

  return {
    hasQuestionnaire,
    eligibility,
    hasGlp1Dossier: hasGlp1,
  };
}
