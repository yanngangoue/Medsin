import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientMonEspace } from "@/components/dashboard/PatientMonEspace";
import { isDemoMode } from "@/lib/is-demo-mode";
import { getGlp1DossierForUser, hasGlp1Dossier } from "@/lib/patient/glp1-dossier";
import { prisma } from "@/lib/prisma";
import type { EligibilityStatus } from "@prisma/client";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/connexion?callbackUrl=/dashboard/patient");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/acces-refuse");
  }

  let eligibility: EligibilityStatus = "PENDING";
  let glp1Summary = null;
  let hasGlp1 = false;

  if (!isDemoMode()) {
    const [profile, dossier] = await Promise.all([
      prisma.patientProfile.findUnique({ where: { userId: session.user.id } }),
      getGlp1DossierForUser(session.user.id),
    ]);
    if (profile) {
      eligibility = profile.eligibility;
      hasGlp1 = hasGlp1Dossier(profile.healthInfo);
    }
    if (dossier.submitted && dossier.summary) {
      glp1Summary = dossier.summary;
      hasGlp1 = true;
      eligibility = dossier.summary.eligibility;
    }
  }

  return (
    <PatientMonEspace
      prenom={session.user.prenom ?? session.user.name ?? ""}
      email={session.user.email ?? ""}
      userId={session.user.id}
      eligibility={eligibility}
      hasGlp1Dossier={hasGlp1}
      glp1Summary={glp1Summary}
    />
  );
}
