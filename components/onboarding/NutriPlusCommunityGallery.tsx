import { NUTRI_PLUS_GALLERY_BULLETS } from "@/lib/patient/nutri-plus-content";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import { NUTRI_PLUS_SHOWCASE_PRODUCTS } from "@/lib/patient/nutri-plus-images";

function TealCheck() {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75] text-[11px] font-bold text-white"
      aria-hidden
    >
      ✓
    </span>
  );
}

type Props = { className?: string };

export function NutriPlusCommunityGallery({ className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <ul className="relative z-20 mx-auto mb-8 max-w-lg space-y-2.5 sm:max-w-xl">
        {NUTRI_PLUS_GALLERY_BULLETS.map((text) => (
          <li key={text} className="flex gap-3 text-left text-[13px] leading-snug text-slate-800 sm:text-sm">
            <TealCheck />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {NUTRI_PLUS_SHOWCASE_PRODUCTS.map((item) => (
          <figure
            key={item.id}
            className="relative overflow-hidden rounded-2xl bg-[#EDE4DC] shadow-md ring-1 ring-[#1D9E75]/15"
          >
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <NutriPlusImage
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 480px"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--teal-900)]/75 to-transparent px-4 pb-3 pt-10 text-sm font-bold text-white">
              Compléments en {item.label.toLowerCase()}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-[10px] leading-relaxed text-slate-400">
        Boîte de gélules et compléments en poudre — accompagnement humain Nutri+, sans repas livrés.
      </p>
    </div>
  );
}
