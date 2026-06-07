import Link from "next/link";
import { ELIGIBILITY_PATH } from "@/lib/marketing/landing-content";

type Props = {
  isPatientSession?: boolean;
};

export function MarketingHero({ isPatientSession = false }: Props) {
  const startHref = ELIGIBILITY_PATH;

  return (
    <section className="bg-[#F0FBF7]">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:max-w-4xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C8E6D9] bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] shadow-sm">
          <span aria-hidden>🇨🇦</span>
          Disponible partout au Québec et au Canada
        </p>

        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[#1A1A2E] sm:text-5xl lg:text-[3.25rem]">
          Perdez du poids durablement.
          <br className="hidden sm:block" />
          Suivi médical + Anne, votre coach IA.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1A1A2E]/75 sm:text-lg">
          Ordonnance GLP-1 par une IPS certifiée, livrée chez vous. Anne, votre coach santé IA,
          vous accompagne chaque semaine — en premier.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={startHref}
            className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#3EBD93] px-8 text-base font-semibold text-white shadow-sm transition hover:bg-[#35a882] sm:w-auto"
          >
            Suis-je éligible ? →
          </Link>
          <a
            href="#tarifs"
            className="inline-flex h-14 w-full items-center justify-center rounded-xl border border-[#C8E6D9] bg-white px-8 text-base font-semibold text-[#1A1A2E] transition hover:border-[#1D4D3A]/30 sm:w-auto"
          >
            Voir les tarifs
          </a>
        </div>

        <div className="mt-8 space-y-2 text-sm text-[#1A1A2E]/70">
          <p>
            <span className="text-amber-500" aria-hidden>
              ⭐⭐⭐⭐⭐
            </span>{" "}
            <span className="font-semibold text-[#1A1A2E]">4,9/5</span>
          </p>
          <p>
            <span aria-hidden>🔒</span> IPS certifiées Québec · <span aria-hidden>🚚</span> Livraison
            discrète
          </p>
        </div>
      </div>
    </section>
  );
}
