import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PatientCommentsSection } from "@/components/patient/PatientCommentsSection";
import { PatientServiceDetailSection } from "@/components/patient/PatientServiceDetailSection";
import { PatientServicesHub } from "@/components/patient/PatientServicesHub";
import { PatientStickyScrollHeader } from "@/components/patient/PatientStickyScrollHeader";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import type { PatientHubContext } from "@/lib/patient/patient-hub";
import { PATIENT_HOMEPAGE_GRADIENT } from "@/lib/patient/homepage-surface";
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
    <div className={`min-h-screen ${PATIENT_HOMEPAGE_GRADIENT}`}>
      {hasAccount ? (
        <div className="border-b border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-white/90">
              Bonjour, <span className="font-semibold text-white">{prenom}</span>
            </p>
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="font-semibold text-white hover:text-white/80 hover:underline"
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
          <section className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-sm backdrop-blur-sm sm:mt-4 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Votre suivi personnel</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              Dossier, messages et rendez-vous sont dans votre espace patient. Ici, vous parcourez
              librement la présentation des services MedSim.
            </p>
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[#1D4D3A] hover:bg-white/95"
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
