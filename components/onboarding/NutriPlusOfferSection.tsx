import { NUTRI_PLUS_OFFER, NUTRI_PLUS_SERVICE_PILLARS } from "@/lib/patient/nutri-plus-content";

export function NutriPlusOfferSection() {
  return (
    <section
      id="nutri-plus"
      className="scroll-mt-24 border-t border-[#E8E0D8]/60 bg-gradient-to-b from-[#F5F0EB] to-white px-4 py-12 sm:px-8 sm:py-14"
      aria-labelledby="nutri-offer-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1D9E75]">
          {NUTRI_PLUS_OFFER.eyebrow}
        </p>
        <h2
          id="nutri-offer-title"
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]"
        >
          {NUTRI_PLUS_OFFER.title}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {NUTRI_PLUS_OFFER.lead}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-3 sm:gap-6">
        {NUTRI_PLUS_SERVICE_PILLARS.map((pillar, i) => (
          <article
            key={pillar.id}
            className="rounded-2xl border border-[#C8E6D9]/60 bg-white p-6 shadow-sm ring-1 ring-[#1D9E75]/10"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9E75] text-sm font-black text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
