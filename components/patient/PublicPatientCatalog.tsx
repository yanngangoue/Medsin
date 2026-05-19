import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PatientCommentsSection } from "@/components/patient/PatientCommentsSection";
import { PatientServiceDetailSection } from "@/components/patient/PatientServiceDetailSection";
import { PatientServicesHub } from "@/components/patient/PatientServicesHub";
import { PatientStickyScrollHeader } from "@/components/patient/PatientStickyScrollHeader";
import { PATIENT_SERVICE_SECTIONS } from "@/lib/patient/service-sections";

type Props = {
  prenom?: string;
  showAuthLinks?: boolean;
};

export function PublicPatientCatalog({ prenom, showAuthLinks = true }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PatientServicesHub prenom={prenom} showAuthLinks={showAuthLinks} />
      <PatientStickyScrollHeader showAuthLinks={showAuthLinks} />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-0 sm:px-6">
        {PATIENT_SERVICE_SECTIONS.map((section) => (
          <PatientServiceDetailSection key={section.id} section={section} />
        ))}

        {showAuthLinks ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-6 text-center shadow-sm sm:mt-4 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Accédez à votre parcours personnalisé
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Créez un compte ou connectez-vous pour suivre votre dossier médical, vos objectifs et
              vos recommandations nutritionnelles.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/onboarding/inscription"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white hover:bg-[#188763]"
              >
                Créer mon compte
              </Link>
              <Link
                href="/connexion?callbackUrl=/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </section>
        ) : null}

        <PatientCommentsSection />
      </main>

      <Footer />
    </div>
  );
}
