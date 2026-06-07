import Image from "next/image";
import Link from "next/link";
import { GLP1_MEDICATIONS } from "@/lib/patient/glp1-content";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";

const PANEL_CLASS: Record<string, string> = {
  ozempic: "bg-[#E8F5F0]",
  wegovy: "bg-[#FAF6F1]",
  mounjaro: "bg-[#EEF2F6]",
};

export const GLP1_PRODUCT_CTA = "Visite gratuite →";

type Props = {
  href: string;
  className?: string;
};

export function Glp1ProductCards({
  href = ELIGIBILITY_QUESTIONNAIRE_PATH,
  className = "",
}: Props) {
  return (
    <ul
      className={`grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 ${className}`.trim()}
    >
      {GLP1_MEDICATIONS.map((med) => (
        <li key={med.id} className="h-full">
          <Link
            href={href}
            aria-label={`${med.name} — ${GLP1_PRODUCT_CTA}`}
            className="group relative block h-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <div
              className={`relative aspect-[3/4] w-full sm:aspect-[4/5] ${PANEL_CLASS[med.id] ?? "bg-white"}`}
            >
              <Image
                src={med.image}
                alt={med.imageAlt}
                fill
                unoptimized
                className="object-contain object-center p-6 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-8"
                sizes="(max-width: 640px) 90vw, 320px"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
              aria-hidden
            />
            <p className="absolute left-4 top-4 text-lg font-semibold leading-tight text-white drop-shadow-sm sm:text-xl">
              {med.name}®
            </p>
            <span className="absolute bottom-4 left-4 inline-flex rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition group-hover:bg-white sm:text-sm">
              {GLP1_PRODUCT_CTA}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
