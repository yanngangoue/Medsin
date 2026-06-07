import Link from "next/link";
import { ELIGIBILITY_PATH } from "@/lib/marketing/landing-content";

type Props = {
  isPatientSession?: boolean;
};

export function MarketingCta({ isPatientSession: _isPatientSession = false }: Props) {
  const startHref = ELIGIBILITY_PATH;

  return (
    <section className="bg-[#1D4D3A] py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Commencez votre parcours aujourd&apos;hui
        </h2>
        <p className="mt-4 text-base text-white/80">
          Évaluation gratuite · Réponse en moins de 24 h
        </p>
        <Link
          href={startHref}
          className="mt-8 inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-semibold text-[#1D4D3A] transition hover:bg-[#FAFAF8]"
        >
          Démarrer mon évaluation
        </Link>
      </div>
    </section>
  );
}
