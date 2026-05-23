import {
  NUTRI_PLUS_POSITIONING,
  NUTRI_PLUS_STATS,
} from "@/lib/patient/nutri-plus-content";
import { NUTRI_PLUS_SHOWCASE_CARDS, type NutriPlusShowcaseCard } from "@/lib/patient/nutri-plus-showcase";
import { HoverZoomImage } from "@/components/ui/HoverZoomImage";

function ShowcaseCard({ card }: { card: NutriPlusShowcaseCard }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.05]">
      <HoverZoomImage
        src={card.image}
        alt={card.imageAlt}
        fill
        zoom="subtle"
        containerClassName={`aspect-[4/5] w-full sm:aspect-[3/4] ${card.panelClass}`}
        imageClassName="object-cover object-center"
        sizes="(max-width: 640px) 50vw, 25vw"
      />
      <div className="border-t border-slate-100 px-3 py-4 text-center sm:px-4 sm:py-5">
        <h3 className="text-sm font-bold text-slate-900 sm:text-[15px]">{card.title}</h3>
        <p className="mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs">{card.description}</p>
      </div>
    </article>
  );
}

export function NutriPlusUnderstandNutrition() {
  return (
    <section
      id="comprendre-nutrition"
      className="scroll-mt-24 border-t border-slate-200/50 bg-white py-12 sm:py-16"
      aria-labelledby="nutri-comprendre-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1D9E75]">
            Comprendre la nutrition
          </p>
          <h2
            id="nutri-comprendre-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]"
          >
            Gélules et poudre — l&apos;essentiel de Nutri+
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            {NUTRI_PLUS_POSITIONING.lead}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {NUTRI_PLUS_POSITIONING.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {NUTRI_PLUS_SHOWCASE_CARDS.map((card) => (
            <ShowcaseCard key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {NUTRI_PLUS_STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[#E8F5F0] bg-[#F8FCFA] px-4 py-4 text-center"
            >
              <p className="text-xl font-black text-[#1D9E75] sm:text-[22px]">{value}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
          Nutri+ ne remplace pas un avis médical. En cas de pathologie ou de traitement en cours, consultez
          un professionnel de santé.
        </p>
      </div>
    </section>
  );
}
