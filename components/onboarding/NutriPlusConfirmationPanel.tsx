import Link from "next/link";
import { NUTRI_PLUS_LANDING_PATH } from "@/lib/patient/nutri-plus-routes";

export function NutriPlusConfirmationPanel() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C8E6D9]/60">
        <svg className="h-8 w-8 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 12l3 3 5-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Profil Nutri+ enregistré</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Vos réponses ont été sauvegardées. Vous pouvez consulter votre espace patient et poursuivre
        votre accompagnement nutritionnel.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/patient"
          className="inline-flex items-center justify-center rounded-full bg-[var(--teal-900)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
        >
          Mon espace patient
        </Link>
        <Link
          href={NUTRI_PLUS_LANDING_PATH}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
        >
          Retour à Nutri+
        </Link>
      </div>
    </div>
  );
}
