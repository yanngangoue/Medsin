import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PatientCommentsSection } from "@/components/patient/PatientCommentsSection";
import { PatientServiceDetailSection } from "@/components/patient/PatientServiceDetailSection";
import { PatientNav } from "@/components/patient/PatientNav";
import { PatientServicesHub } from "@/components/patient/PatientServicesHub";
import { PatientStickyScrollHeader } from "@/components/patient/PatientStickyScrollHeader";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import type { PatientHubContext } from "@/lib/patient/patient-hub";
import { PATIENT_SERVICE_SECTIONS } from "@/lib/patient/service-sections";

type ConnectedPatient = {
  prenom: string;
  hubContext: PatientHubContext;
};

type Props = {
  connectedPatient?: ConnectedPatient | null;
};

export function PublicPatientCatalog({ connectedPatient = null }: Props) {
  const isConnected = Boolean(connectedPatient);

  const hasGlp1 = connectedPatient?.hubContext.hasGlp1Dossier ?? false;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {isConnected ? (
        <div className="border-b border-[var(--teal-900)]/20 bg-[var(--teal-900)] px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <PatientNav hasGlp1Dossier={hasGlp1} variant="dark" showLogo showSignOut />
          </div>
        </div>
      ) : null}
      <PatientServicesHub
        prenom={connectedPatient?.prenom}
        variant={isConnected ? "connected" : "public"}
        hubContext={
          connectedPatient?.hubContext ?? {
            hasQuestionnaire: false,
            eligibility: "PENDING",
            hasGlp1Dossier: false,
          }
        }
        showAuthLinks={!isConnected}
        hideTopNav={isConnected}
      />
      <PatientStickyScrollHeader
        showAuthLinks={!isConnected}
        connectedHasGlp1={hasGlp1}
      />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-0 sm:px-6">
        {PATIENT_SERVICE_SECTIONS.map((section) => (
          <PatientServiceDetailSection key={section.id} section={section} />
        ))}

        {isConnected ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-[#C8E6D9]/80 bg-[#F0FBF7] p-6 text-center shadow-sm sm:mt-4 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Votre espace personnel</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Consultez votre dossier GLP-1, échangez avec l&apos;équipe médicale ou planifiez une
              téléconsultation. Vous pouvez aussi parcourir librement les services ci-dessus.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={GLP1_PATIENT_DASHBOARD_PATH}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white hover:bg-[#188763]"
              >
                Mon espace patient
              </Link>
              <Link
                href="#patient-services-hub"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Parcourir les services
              </Link>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm sm:mt-4 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Prêt à commencer votre parcours ?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Parcourez les services ci-dessus sans compte. Créez un compte pour accéder à votre hub
              personnel : dossier, éligibilité GLP-1 et suivi nutritionnel.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/inscription"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white hover:bg-[#188763]"
              >
                Démarrer mon parcours
              </Link>
              <Link
                href="/auth/connexion?callbackUrl=/dashboard/patient"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </section>
        )}

        <PatientCommentsSection />
      </main>

      <Footer />
    </div>
  );
}
