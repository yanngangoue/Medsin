import Image from "next/image";
import Link from "next/link";
import { getServiceCtaHref, type PatientServiceSection } from "@/lib/patient/service-sections";

type Props = {
  section: PatientServiceSection;
};

function CheckIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
      <path
        d="M1 5.2 4.2 8.5 11 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckItem({
  children,
  accentClass = "bg-[var(--teal)]",
}: {
  children: string;
  accentClass?: string;
}) {
  return (
    <li className="flex gap-3 text-left">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${accentClass}`}
        aria-hidden
      >
        <CheckIcon />
      </span>
      <span className="text-[15px] leading-snug text-slate-700">{children}</span>
    </li>
  );
}

function SectionPhoto({
  src,
  alt,
  variant = "person",
  productFrameClass,
  productCover = false,
}: {
  src: string;
  alt: string;
  variant?: "person" | "product";
  productFrameClass?: string;
  productCover?: boolean;
}) {
  const isProduct = variant === "product";
  const isLocalImage = src.startsWith("/");

  return (
    <div
      className={`relative w-full overflow-hidden ${
        isProduct
          ? productFrameClass ?? "aspect-[4/3] bg-white"
          : "aspect-[3/4] rounded-2xl bg-slate-100 shadow-sm"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={isLocalImage}
        className={
          isProduct
            ? productCover
              ? "object-cover object-center"
              : "object-contain object-center"
            : "object-cover object-center"
        }
        sizes={isProduct ? "(max-width: 640px) 100vw, 560px" : "(max-width: 640px) 50vw, 320px"}
      />
    </div>
  );
}

export function PatientServiceDetailSection({ section }: Props) {
  const accentClass = section.accentClass ?? "bg-[var(--teal)]";
  const accentTextClass = section.accentTextClass ?? "text-[var(--teal)]";

  return (
    <section
      id={section.id}
      className={`scroll-mt-24 border-b border-slate-200/80 py-12 last:border-b-0 sm:py-16${
        section.sectionClassName ? ` ${section.sectionClassName}` : ""
      }`}
      aria-labelledby={`${section.id}-title`}
    >
      <div className="text-center">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${accentTextClass}`}
        >
          {section.eyebrow}
        </p>
        <h2
          id={`${section.id}-title`}
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[32px]"
        >
          {section.title}
        </h2>

        <div className="relative mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-4 sm:mt-8 sm:max-w-3xl sm:gap-5">
          <div className="translate-y-0 sm:translate-y-2">
            <SectionPhoto src={section.imagePrimary} alt={section.imagePrimaryAlt} />
          </div>
          <div className="-translate-y-3 sm:-translate-y-5">
            <SectionPhoto src={section.imageSecondary} alt={section.imageSecondaryAlt} />
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:mt-8 sm:text-base">
          {section.body}
        </p>

        <div className="mx-auto mt-6 max-w-md sm:mt-8 sm:max-w-lg">
          <SectionPhoto
            src={section.productImage}
            alt={section.productImageAlt}
            variant="product"
            productFrameClass={section.productFrameClass}
            productCover={section.productCover ?? false}
          />
        </div>

        <div className="mx-auto mt-6 max-w-md text-left sm:mt-8">
          <p className="text-center text-base font-semibold text-slate-900">
            {section.includesTitle}
          </p>
          <ul className="mt-3 space-y-3 sm:mt-4 sm:space-y-3.5">
            {section.bullets.map((item) => (
              <CheckItem key={item} accentClass={accentClass}>
                {item}
              </CheckItem>
            ))}
          </ul>
        </div>

        <Link
          href={getServiceCtaHref(section.id)}
          className={`mt-6 inline-flex items-center justify-center rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 sm:mt-8 ${accentClass}`}
        >
          En savoir plus
        </Link>
      </div>
    </section>
  );
}

