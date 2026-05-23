import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import Link from "next/link";
import { NutriPlusHeader } from "@/components/onboarding/NutriPlusHeader";
import { NUTRI_PLUS_LANDING_PATH } from "@/lib/patient/nutri-plus-routes";
import {
  NUTRI_PLUS_OFFERINGS,
  type NutriPlusOffering,
} from "@/lib/patient/nutri-plus-products";
import {
  NUTRI_PLUS_IMG_CAPSULES,
  NUTRI_PLUS_IMG_CAPSULES_ALT,
  NUTRI_PLUS_IMG_POWDER,
  NUTRI_PLUS_IMG_POWDER_ALT,
} from "@/lib/patient/nutri-plus-images";

function FormatBadge({ format }: { format: NutriPlusOffering["format"] }) {
  const styles =
    format === "Poudre"
      ? "bg-white/95 text-[#6B4423] shadow-sm"
      : "bg-white/95 text-[#1D9E75] shadow-sm";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {format}
    </span>
  );
}

function OfferingCard({ offering, priority }: { offering: NutriPlusOffering; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md ring-1 ring-[#1D9E75]/10 transition hover:shadow-lg">
      <div className={`relative aspect-[5/3] w-full overflow-hidden sm:aspect-[16/10] ${offering.panelClass}`}>
        <NutriPlusImage
          src={offering.image}
          alt={offering.imageAlt}
          fill
          className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority={priority}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent"
          aria-hidden
        />
        <div className="absolute left-4 top-4">
          <FormatBadge format={offering.format} />
        </div>
        <h2 className="absolute bottom-4 left-4 right-4 text-lg font-bold leading-snug text-white drop-shadow-sm sm:text-xl">
          {offering.title}
        </h2>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex-1 text-sm leading-relaxed text-slate-600">{offering.description}</p>
        {offering.detail ? (
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-[#1D9E75]">{offering.detail}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

const HERO_PRODUCTS = [
  { src: NUTRI_PLUS_IMG_CAPSULES, alt: NUTRI_PLUS_IMG_CAPSULES_ALT, label: "Gélules" },
  { src: NUTRI_PLUS_IMG_POWDER, alt: NUTRI_PLUS_IMG_POWDER_ALT, label: "Poudre" },
] as const;

export function NutriPlusProductsCatalog() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0EB]">
      <div className="bg-[var(--teal-900)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Nutri+ — compléments en gélules et en poudre
      </div>
      <NutriPlusHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1D9E75]">Nutri+</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
            Compléments en gélules et en poudre
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Deux formats Nutri+ pour votre nutrition ciblée — sans repas livrés, uniquement des
            compléments partenaires MedSim.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-10 sm:grid-cols-2">
          {HERO_PRODUCTS.map((item) => (
            <figure
              key={item.label}
              className="relative overflow-hidden rounded-2xl bg-[#EDE4DC] shadow-lg ring-1 ring-[#1D9E75]/15"
            >
              <div className="relative aspect-[4/3] w-full">
                <NutriPlusImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 480px"
                  priority
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--teal-900)]/80 to-transparent px-4 pb-4 pt-12">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8E6D9]">
                  Nutri+
                </span>
                <p className="mt-1 text-base font-bold text-white">Compléments en {item.label.toLowerCase()}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <ul className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-2 lg:gap-8">
          {NUTRI_PLUS_OFFERINGS.map((offering) => (
            <li key={offering.id} className="min-h-0">
              <OfferingCard offering={offering} priority />
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
          Les compléments Nutri+ sont orientés selon votre profil. Un professionnel MedSim valide
          l&apos;orientation avant tout changement de routine.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href={NUTRI_PLUS_LANDING_PATH}
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200/90 bg-white px-8 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#1D9E75]/30 hover:text-[var(--teal-900)]"
          >
            Retour à Nutri+
          </Link>
        </div>
      </main>
    </div>
  );
}
