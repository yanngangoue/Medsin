import Image from "next/image";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { HERO_IMAGE, INSCRIPTION_HREF } from "@/lib/nutrition/content";

export function HeroNutrition() {
  return (
    <section className="bg-[#FAFAF8] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="max-w-xl">
          <FadeIn>
            <span className="inline-flex rounded-full bg-[#7CAE9E]/20 px-4 py-1.5 text-sm font-medium text-[#2D5A4E]">
              Nutri+ par MedSim
            </span>
          </FadeIn>

          <SlideUp delay={0.08} className="mt-8">
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-[#2D5A4E] sm:text-5xl lg:text-[3.25rem]">
              Des compléments pensés
              <br />
              pour votre corps
            </h1>
          </SlideUp>

          <FadeIn delay={0.16} className="mt-6">
            <p className="text-lg leading-relaxed text-[#6B7280] sm:text-xl">
              Sélectionnés par nos nutritionnistes,
              <br className="hidden sm:block" />
              adaptés à votre profil de santé unique.
            </p>
          </FadeIn>

          <FadeIn delay={0.24} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={INSCRIPTION_HREF}
              className="inline-flex items-center justify-center rounded-full bg-[#7CAE9E] px-8 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a9d8f] sm:text-base"
            >
              Découvrir mes compléments
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#7CAE9E] bg-transparent px-8 py-3.5 text-center text-sm font-semibold text-[#2D5A4E] transition hover:bg-[#7CAE9E]/10 sm:text-base"
            >
              En savoir plus
            </a>
          </FadeIn>
        </div>

        <SlideUp delay={0.12} className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white shadow-md sm:aspect-[5/6]">
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 560px"
              priority
            />
          </div>
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-[#7CAE9E]/15 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F0F7F4] blur-xl"
            aria-hidden
          />
        </SlideUp>
      </div>
    </section>
  );
}
