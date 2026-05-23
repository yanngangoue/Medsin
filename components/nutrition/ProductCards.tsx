import Image from "next/image";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/nutrition/NutritionMotion";
import { INSCRIPTION_HREF, NUTRITION_PRODUCTS } from "@/lib/nutrition/content";

export function ProductCards() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SlideUp>
            <h2 className="text-3xl font-semibold tracking-tight text-[#2D5A4E] sm:text-4xl">
              Nos compléments les plus demandés
            </h2>
          </SlideUp>
          <FadeIn delay={0.1} className="mt-4">
            <p className="text-lg text-[#6B7280]">
              Formulés pour accompagner votre parcours santé
            </p>
          </FadeIn>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {NUTRITION_PRODUCTS.map((product, i) => (
            <FadeIn key={product.id} delay={0.05 * (i % 3)}>
              <article
                className={`flex h-full flex-col overflow-hidden rounded-2xl bg-[#FAFAF8] shadow-sm transition hover:shadow-md ${
                  product.featured
                    ? "ring-2 ring-[#7CAE9E] ring-offset-2 ring-offset-white"
                    : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#2D5A4E] shadow-sm backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="text-xl font-semibold text-[#2D5A4E]">{product.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {product.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {product.benefits.map((b) => (
                      <li
                        key={b}
                        className="rounded-full bg-[#7CAE9E]/15 px-3 py-1 text-xs font-medium text-[#2D5A4E]"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 text-sm font-semibold text-[#7CAE9E]">{product.price}</p>

                  <Link
                    href={INSCRIPTION_HREF}
                    className={`mt-5 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      product.featured
                        ? "bg-[#7CAE9E] text-white hover:bg-[#6a9d8f]"
                        : "border-2 border-[#7CAE9E] text-[#2D5A4E] hover:bg-[#7CAE9E]/10"
                    }`}
                  >
                    {product.cta}
                  </Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
