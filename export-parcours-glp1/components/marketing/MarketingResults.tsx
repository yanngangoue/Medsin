import { RESULT_STATS, TESTIMONIALS } from "@/lib/marketing/landing-content";

export function MarketingResults() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
          Des résultats réels, un suivi humain
        </h2>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3">
          {RESULT_STATS.map((stat) => (
            <li key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-[#1D4D3A] sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-[#1A1A2E]/65">{stat.label}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.name}
              className="flex flex-col rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 shadow-sm"
            >
              <p className="text-2xl font-bold text-[#3EBD93]">{t.weightLoss}</p>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#1A1A2E]/80">
                « {t.quote} »
              </blockquote>
              <footer className="mt-4 border-t border-gray-100 pt-4 text-sm">
                <p className="font-semibold text-[#1A1A2E]">{t.name}</p>
                <p className="text-xs text-[#1A1A2E]/55">{t.city}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
