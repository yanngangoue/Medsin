import Link from "next/link";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import { NUTRI_PLUS_COMPLEMENTS } from "@/lib/patient/nutri-plus-content";
import { NUTRI_PLUS_SHOWCASE_PRODUCTS } from "@/lib/patient/nutri-plus-images";
import { NUTRI_PLUS_PRODUCTS_PATH } from "@/lib/patient/nutri-plus-routes";

export function NutriPlusComplementsSection() {
  return (
    <section
      id="complements-nutri"
      className="relative overflow-hidden border-t border-[#E8E0D8]/40 bg-[#F5F0EB] py-14 sm:py-16"
      aria-labelledby="complements-title"
    >
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[#1D9E75]/6 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#EDE4DC] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B4423]">
            {NUTRI_PLUS_COMPLEMENTS.eyebrow}
          </p>
          <h2
            id="complements-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {NUTRI_PLUS_COMPLEMENTS.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {NUTRI_PLUS_COMPLEMENTS.lead}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {NUTRI_PLUS_SHOWCASE_PRODUCTS.map((product, i) => (
            <article
              key={product.id}
              className={`group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_48px_-20px_rgba(42,31,24,0.2)] ring-1 ring-white/90 transition hover:shadow-[0_24px_56px_-16px_rgba(29,78,59,0.15)] ${
                i === 0 ? "sm:translate-y-2" : "sm:-translate-y-2"
              }`}
            >
              <div className="relative aspect-[5/4] sm:aspect-[16/11]">
                <NutriPlusImage
                  src={product.src}
                  alt={product.alt}
                  fill
                  className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={i === 0}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#F5F0EB]/40 via-transparent to-[#E8F5F0]/30" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/5 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    product.id === "capsules"
                      ? "bg-[#E8F5F0] text-[#1D4D3A]"
                      : "bg-[#FFF4ED] text-[#6B4423]"
                  }`}
                >
                  {product.label}
                </span>
                <p className="mt-3 text-lg font-bold text-white drop-shadow-sm sm:text-xl">
                  {product.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-slate-500">
          {NUTRI_PLUS_COMPLEMENTS.note}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={NUTRI_PLUS_PRODUCTS_PATH}
            className="inline-flex items-center gap-2 rounded-full border border-[#C8E6D9] bg-white px-6 py-3 text-sm font-semibold text-[var(--teal-900)] shadow-sm transition hover:border-[#1D9E75] hover:bg-[#F8FCFA]"
          >
            {NUTRI_PLUS_COMPLEMENTS.cta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
