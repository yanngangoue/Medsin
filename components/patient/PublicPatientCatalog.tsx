import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PatientCommentsSection } from "@/components/patient/PatientCommentsSection";
import { PatientServiceDetailSection } from "@/components/patient/PatientServiceDetailSection";
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

/**
 * Accueil catalogue : feuilletage public pour tous.
 * « Mon espace patient » uniquement si compte patient (bandeau discret), pas de nav espace sur l’accueil.
 */
export function PublicPatientCatalog({ connectedPatient = null }: Props) {
  const hasAccount = Boolean(connectedPatient);
  const prenom = connectedPatient?.prenom ?? "";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {hasAccount ? (
        <div className="border-b border-[#C8E6D9]/60 bg-[#F0FBF7] px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-slate-700">
              Bonjour, <span className="font-semibold text-slate-900">{prenom}</span>
            </p>
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="font-semibold text-[#1D9E75] hover:text-[var(--teal-900)] hover:underline"
            >
              Mon espace patient →
            </Link>
          </div>
        </div>
      ) : null}

      <PatientServicesHub
        prenom={hasAccount ? prenom : undefined}
        variant="public"
        hubContext={
          connectedPatient?.hubContext ?? {
            hasQuestionnaire: false,
            eligibility: "PENDING",
            hasGlp1Dossier: false,
            hasNutriPlusDossier: false,
          }
        }
        showAuthLinks={!hasAccount}
        useSectionAnchors
      />
      <PatientStickyScrollHeader showAuthLinks={!hasAccount} showPatientSpaceLink={hasAccount} />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-0 sm:px-6">
        {PATIENT_SERVICE_SECTIONS.map((section) => (
          <PatientServiceDetailSection key={section.id} section={section} />
        ))}

        {hasAccount ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-[#C8E6D9]/80 bg-[#F0FBF7] p-6 text-center shadow-sm sm:mt-4 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Votre suivi personnel</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Dossier, messages et rendez-vous sont dans votre espace patient. Ici, vous parcourez
              librement la présentation des services MedSim.
            </p>
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white hover:bg-[#188763]"
            >
              Ouvrir mon espace patient
            </Link>
          </section>
        ) : null}

        <PatientCommentsSection />
      </main>

      <Footer />
    </div>
  );
}
