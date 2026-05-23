import Image from "next/image";
import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { TESTIMONIALS } from "@/lib/nutrition/content";

function Stars() {
  return (
    <p className="text-[#7CAE9E]" aria-label="5 étoiles sur 5">
      ★★★★★
    </p>
  );
}

export function TestimonialsNutrition() {
  return (
    <section className="bg-[#F0F7F4] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SlideUp className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D5A4E] sm:text-4xl">
            Ce que disent nos membres
          </h2>
        </SlideUp>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.id} delay={0.1 * i}>
              <article className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm">
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-[#7CAE9E]/30">
                  <Image
                    src={t.image}
                    alt={t.imageAlt}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <Stars />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-[#6B7280]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer className="mt-6 text-sm font-semibold text-[#2D5A4E]">
                  {t.name}
                  <span className="font-normal text-[#6B7280]"> — {t.city}</span>
                </footer>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
