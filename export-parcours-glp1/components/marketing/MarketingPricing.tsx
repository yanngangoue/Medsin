import Link from "next/link";
import { PRICING_PLAN } from "@/lib/marketing/landing-content";
import { ELIGIBILITY_PATH } from "@/lib/marketing/landing-content";

type Props = {
  isPatientSession?: boolean;
};

export function MarketingPricing({ isPatientSession = false }: Props) {
  const startHref = ELIGIBILITY_PATH;

  return (
    <section id="tarifs" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
          Un prix tout inclus. Pas de surprises.
        </h2>

        <div className="mx-auto mt-12 max-w-md">
          <div className="overflow-hidden rounded-2xl border-2 border-[#1D4D3A]/20 bg-white shadow-sm">
            <div className="bg-[#1D4D3A] px-6 py-5 text-center text-white">
              <p className="text-sm font-medium text-white/85">{PRICING_PLAN.name}</p>
              <p className="mt-2 text-4xl font-bold">
                {PRICING_PLAN.price}$
                <span className="text-lg font-medium text-white/80">/{PRICING_PLAN.period}</span>
              </p>
              <p className="text-sm text-white/75">tout inclus</p>
            </div>

            <ul className="space-y-3 px-6 py-8">
              {PRICING_PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#1A1A2E]/85">
                  <span className="font-bold text-[#3EBD93]" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 px-6 py-6">
              <Link
                href={startHref}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#3EBD93] text-sm font-semibold text-white transition hover:bg-[#35a882]"
              >
                Commencer maintenant
              </Link>
              <p className="mt-4 text-center text-xs text-[#1A1A2E]/55">{PRICING_PLAN.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
