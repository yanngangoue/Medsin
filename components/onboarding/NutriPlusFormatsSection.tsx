import { NUTRI_PLUS_GALLERY_BULLETS } from "@/lib/patient/nutri-plus-content";
import { NutriPlusImage } from "@/components/onboarding/NutriPlusImage";
import {
  NUTRI_PLUS_IMG_CAPSULES,
  NUTRI_PLUS_IMG_CAPSULES_ALT,
  NUTRI_PLUS_IMG_POWDER,
  NUTRI_PLUS_IMG_POWDER_ALT,
} from "@/lib/patient/nutri-plus-images";

const FORMATS = [
  {
    id: "gelules",
    label: "Gélules",
    title: "Boîte de gélules & compléments alimentaires",
    body: "Vitamines, oméga-3, minéraux — boîte de gélules partenaires Nutri+.",
    src: NUTRI_PLUS_IMG_CAPSULES,
    alt: NUTRI_PLUS_IMG_CAPSULES_ALT,
    accent: "from-[var(--teal-900)]/80",
  },
  {
    id: "poudre",
    label: "Poudre",
    title: "Compléments en poudre",
    body: "Protéines, fibres et nutrition ciblée selon votre profil déclaré.",
    src: NUTRI_PLUS_IMG_POWDER,
    alt: NUTRI_PLUS_IMG_POWDER_ALT,
    accent: "from-slate-900/75",
  },
] as const;

type Props = { className?: string };

export function NutriPlusFormatsSection({ className = "" }: Props) {
  return (
    <div className={className}>
      <ul className="mx-auto mb-8 flex max-w-2xl flex-col gap-2 sm:mb-10">
        {NUTRI_PLUS_GALLERY_BULLETS.map((text) => (
          <li
            key={text}
            className="flex gap-3 rounded-xl border border-[#C8E6D9]/50 bg-white/80 px-4 py-2.5 text-sm text-slate-700"
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75] text-[11px] font-bold text-white"
              aria-hidden
            >
              ✓
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 sm:gap-6">
        {FORMATS.map((format) => (
          <article
            key={format.id}
            className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-[#1D9E75]/10 transition hover:ring-[#1D9E75]/25"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE4DC]">
              <NutriPlusImage
                src={format.src}
                alt={format.alt}
                fill
                className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${format.accent} via-transparent to-transparent`}
                aria-hidden
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1D9E75] shadow-sm">
                {format.label}
              </span>
            </div>
            <div className="border-t border-[#E8F5F0] px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">{format.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{format.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
