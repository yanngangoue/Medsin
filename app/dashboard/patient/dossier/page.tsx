import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Glp1ConfirmationPanel } from "@/components/onboarding/Glp1ConfirmationPanel";
import { PatientNav } from "@/components/patient/PatientNav";
import { Glp1FlowBreadcrumb } from "@/components/onboarding/Glp1FlowBreadcrumb";
import { getGlp1DossierForUser } from "@/lib/patient/glp1-dossier";
import {
  GLP1_EVALUATION_PATH,
  GLP1_PATIENT_DASHBOARD_PATH,
} from "@/lib/patient/glp1-flow-routes";
import { glp1QuestionnaireResumeUrl } from "@/lib/patient/glp1-wizard-progress";

export default async function PatientDossierPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/dashboard/patient/dossier");
  }
  if (session.user.role !== "PATIENT") redirect("/acces-refuse");

  const dossier = await getGlp1DossierForUser(session.user.id);
  if (!dossier.submitted || !dossier.summary) {
    redirect(GLP1_EVALUATION_PATH);
  }

  const prenom = session.user.prenom ?? session.user.name ?? "";

  return (
    <div className="min-h-screen bg-[#FAFCFB]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3.5 sm:px-8">
          <PatientNav hasGlp1Dossier={true} showLogo showSignOut />
        </div>
      </header>
      <Glp1FlowBreadcrumb />

      <main className="mx-auto max-w-lg px-4 pb-12 sm:px-6">
        <Glp1ConfirmationPanel prenom={prenom} summary={dossier.summary} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={glp1QuestionnaireResumeUrl()}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Modifier mes réponses
          </Link>
          <Link
            href={GLP1_PATIENT_DASHBOARD_PATH}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-bold text-white hover:bg-[#178f6a]"
          >
            Retour à mon espace
          </Link>
        </div>
      </main>
    </div>
  );
}
