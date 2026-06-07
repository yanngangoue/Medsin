import Image from "next/image";
import Link from "next/link";
import { MARKETING_MEDICATIONS } from "@/lib/marketing/landing-content";
import { ELIGIBILITY_PATH } from "@/lib/marketing/landing-content";

type Props = {
  isPatientSession?: boolean;
};

export function MarketingMedications({ isPatientSession = false }: Props) {
  const startHref = ELIGIBILITY_PATH;

  return (
    <section id="medicaments" className="scroll-mt-24 bg-[#FAFAF8] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
          Médicaments GLP-1 disponibles
        </h2>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {MARKETING_MEDICATIONS.map((med) => (
            <li
              key={med.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="relative mx-auto flex h-36 w-full items-center justify-center">
                {med.image ? (
                  <Image
                    src={med.image}
                    alt={med.imageAlt}
                    width={140}
                    height={140}
                    className="h-32 w-auto object-contain"
                  />
                ) : (
                  <div
                    className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#F0F7F4] text-4xl"
                    aria-hidden
                  >
                    💊
                  </div>
                )}
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#1A1A2E]">{med.name}</h3>
              <p className="mt-1 text-sm font-medium text-[#1D4D3A]">{med.ingredient}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#1A1A2E]/70">
                {med.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#1A1A2E]">
                À partir de {med.priceFrom} $/mois
              </p>
              <Link
                href={startHref}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-[#1D4D3A]/20 text-sm font-semibold text-[#1D4D3A] transition hover:border-[#1D4D3A] hover:bg-[#F0F7F4]"
              >
                En savoir plus
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-[#1A1A2E]/55">
          Sous prescription médicale uniquement · Évaluation requise
        </p>
      </div>
    </section>
  );
}
