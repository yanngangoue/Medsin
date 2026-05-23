import {
  MEDSIM_PLATFORM_NUTRI_DISCLAIMER,
  NUTRI_PLUS_POSITIONING,
  NUTRI_PLUS_STATS,
} from "@/lib/patient/nutri-plus-content";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import { NUTRI_PLUS_SERVICE_SHOWCASE } from "@/lib/patient/nutri-plus-images";

export function NutriPlusParcoursSection() {
  return (
    <section
      id="comprendre-nutrition"
      className="scroll-mt-24 border-t border-[#E8E0D8]/60 bg-white py-12 sm:py-16"
      aria-labelledby="nutri-comprendre-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1D9E75]">
            Nutri+ en pratique
          </p>
          <h2
            id="nutri-comprendre-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]"
          >
            {NUTRI_PLUS_POSITIONING.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            {NUTRI_PLUS_POSITIONING.lead}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {NUTRI_PLUS_POSITIONING.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {NUTRI_PLUS_SERVICE_SHOWCASE.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-[#1D9E75]/15"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE4DC]">
                <NutriPlusImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--teal-900)]/75 to-transparent" aria-hidden />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1D9E75]">
                  {item.label}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-4 py-4">
                <p className="text-base font-bold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {NUTRI_PLUS_STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[#C8E6D9]/60 bg-[#F5F0EB] px-4 py-4 text-center"
            >
              <p className="text-xl font-black text-[#1D9E75] sm:text-[22px]">{value}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
          {MEDSIM_PLATFORM_NUTRI_DISCLAIMER} En cas de pathologie ou de traitement en cours, consultez
          un professionnel de santé.
        </p>
      </div>
    </section>
  );
}
