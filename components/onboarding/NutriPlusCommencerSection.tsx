"use client";

import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import { NutriPlusPlanBuilder } from "@/components/onboarding/NutriPlusPlanBuilder";
import { useNutriPlusPlan } from "@/components/onboarding/NutriPlusPlanContext";
import { NUTRI_PLUS_PRIMARY_CTA } from "@/lib/onboarding/service-nutri-plus";
import { NUTRI_PLUS_ACCOMPAGNEMENT } from "@/lib/patient/nutri-plus-content";
import { MEDSIM_SUIVI_STEPS } from "@/lib/patient/nutri-plus-images";

export function NutriPlusCommencerSection() {
  const { isPlanOpen, openPlan } = useNutriPlusPlan();
  const { eyebrow, title, lead, stepsTitle, ctaHint, closing } = NUTRI_PLUS_ACCOMPAGNEMENT;

  return (
    <section
      id="commencer"
      className="relative scroll-mt-24 border-t-4 border-[#1D9E75] bg-[var(--teal-900)] px-4 py-14 sm:px-8 sm:py-20"
      aria-labelledby="nutri-commencer-title"
    >
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#1D9E75]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center lg:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C8E6D9]">
            {eyebrow}
          </p>
          <h2
            id="nutri-commencer-title"
            className="mt-3 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl"
          >
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-[15px]">{lead}</p>
        </div>

        <div className="mt-10 border-t border-white/10 pt-10 lg:mt-12">
          <h3 className="text-center text-sm font-bold uppercase tracking-[0.14em] text-[#C8E6D9] lg:text-left">
            {stepsTitle}
          </h3>
          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-5">
            {MEDSIM_SUIVI_STEPS.map((item) => (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] shadow-xl"
              >
                <figure className="relative">
                  <div className="relative aspect-[4/3] w-full bg-slate-800">
                    <NutriPlusImage
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-12">
                    <span className="inline-flex rounded-full bg-[#1D9E75] px-2.5 py-0.5 text-[10px] font-black text-white">
                      Étape {item.step}
                    </span>
                    <p className="mt-2 text-sm font-bold text-white">{item.caption}</p>
                  </figcaption>
                </figure>
                <div className="flex flex-1 flex-col px-4 py-4">
                  <p className="text-[15px] font-bold text-white">{item.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/75">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          id="nutri-commencer-cta"
          className="mx-auto mt-12 max-w-3xl scroll-mt-28 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-8 text-center sm:px-10 lg:text-left"
        >
          <p className="text-sm font-medium text-[#C8E6D9]">{ctaHint}</p>
          <button
            type="button"
            onClick={openPlan}
            aria-expanded={isPlanOpen}
            aria-controls="mon-plan-nutri"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#F5F0EB] px-8 py-4 text-base font-bold text-[var(--teal-900)] shadow-lg transition hover:bg-white sm:w-auto"
          >
            {NUTRI_PLUS_PRIMARY_CTA}
          </button>
          <p className="mt-6 text-[11px] leading-relaxed text-white/50">{closing}</p>
        </div>

        {isPlanOpen ? (
          <div className="mt-10 rounded-2xl bg-[#F5F0EB] shadow-2xl ring-1 ring-white/30">
            <NutriPlusPlanBuilder />
          </div>
        ) : null}
      </div>
    </section>
  );
}
