import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { INSCRIPTION_HREF } from "@/lib/nutrition/content";

export function CTANutrition() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SlideUp>
          <div
            className="rounded-3xl px-8 py-16 text-center shadow-md sm:px-12 sm:py-20"
            style={{
              background: "linear-gradient(135deg, #7CAE9E 0%, #2D5A4E 100%)",
            }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Prêt à optimiser votre santé ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
              Rejoignez des centaines de Québécois qui prennent soin d&apos;eux avec l&apos;aide de
              nos nutritionnistes.
            </p>

            <FadeIn delay={0.15} className="mt-10">
              <Link
                href={INSCRIPTION_HREF}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-[#2D5A4E] shadow-sm transition hover:bg-[#FAFAF8]"
              >
                Commencer mon bilan gratuit
              </Link>
            </FadeIn>

            <p className="mt-6 text-sm text-white/85">
              ✓ Bilan gratuit &nbsp;&nbsp;✓ Sans engagement &nbsp;&nbsp;✓ Livraison incluse
            </p>
          </div>
        </SlideUp>
      </div>
    </section>
  );
}
