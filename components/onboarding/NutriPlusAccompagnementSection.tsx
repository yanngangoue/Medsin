import Image from "next/image";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import {
  NUTRI_PLUS_ACCOMPAGNEMENT,
  NUTRI_PLUS_MENU_SNAPSHOT,
} from "@/lib/patient/nutri-plus-content";
import { NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS } from "@/lib/patient/nutri-plus-images";
import { NUTRI_MENU_SNAPSHOTS } from "@/lib/patient/nutri-plus-menus";

export function NutriPlusAccompagnementSection() {
  return (
    <section
      id="accompagnement-nutri"
      className="border-t border-[#E8E0D8]/50 bg-gradient-to-b from-white to-[#F8FCFA] py-14 sm:py-16"
      aria-labelledby="accompagnement-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1D9E75]">
            {NUTRI_PLUS_ACCOMPAGNEMENT.eyebrow}
          </p>
          <h2
            id="accompagnement-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {NUTRI_PLUS_ACCOMPAGNEMENT.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {NUTRI_PLUS_ACCOMPAGNEMENT.lead}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {NUTRI_PLUS_ACCOMPAGNEMENT_PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className={`group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b ${pillar.accent} shadow-sm ring-1 ring-[#C8E6D9]/40 transition hover:shadow-md`}
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <NutriPlusImage
                  src={pillar.src}
                  alt={pillar.alt}
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{pillar.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] bg-[#F5F0EB]/80 p-6 ring-1 ring-[#E8E0D8]/60 sm:p-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B4423]/80">
              {NUTRI_PLUS_MENU_SNAPSHOT.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {NUTRI_PLUS_MENU_SNAPSHOT.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {NUTRI_PLUS_MENU_SNAPSHOT.lead}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {NUTRI_MENU_SNAPSHOTS.map((menu) => (
              <figure
                key={menu.id}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] ${
                  menu.span === "tall"
                    ? "row-span-2 aspect-[3/5] sm:aspect-auto"
                    : menu.span === "wide"
                      ? "col-span-2 aspect-[2/1]"
                      : "aspect-square"
                }`}
              >
                <Image
                  src={menu.src}
                  alt={menu.alt}
                  fill
                  className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  sizes="(max-width: 640px) 45vw, 200px"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent px-3 pb-2.5 pt-8">
                  <span className="text-xs font-semibold text-white/95">{menu.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
