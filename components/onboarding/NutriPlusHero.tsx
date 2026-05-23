import { NUTRI_PLUS_HERO } from "@/lib/patient/nutri-plus-content";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import {
  NUTRI_PLUS_IMG_CAPSULES,
  NUTRI_PLUS_IMG_CAPSULES_ALT,
  NUTRI_PLUS_IMG_POWDER,
  NUTRI_PLUS_IMG_POWDER_ALT,
} from "@/lib/patient/nutri-plus-images";

export function NutriPlusHero() {
  return (
    <section className="relative overflow-hidden bg-[#F5F0EB] px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1D9E75]">
            {NUTRI_PLUS_HERO.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {NUTRI_PLUS_HERO.title}
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-800 sm:text-xl">{NUTRI_PLUS_HERO.subtitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-[15px] lg:mx-0">
            {NUTRI_PLUS_HERO.body}
          </p>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#EDE4DC] shadow-lg">
            <NutriPlusImage
              src={NUTRI_PLUS_IMG_CAPSULES}
              alt={NUTRI_PLUS_IMG_CAPSULES_ALT}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 45vw, 280px"
              priority
            />
          </div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl bg-[#EDE4DC] shadow-lg">
            <NutriPlusImage
              src={NUTRI_PLUS_IMG_POWDER}
              alt={NUTRI_PLUS_IMG_POWDER_ALT}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 45vw, 280px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
