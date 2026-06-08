import Link from "next/link";
import { Glp1ProductCards } from "@/components/patient/Glp1ProductCards";
import { PatientGlp1CareProcess } from "@/components/patient/PatientGlp1CareProcess";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";
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
      <span className="text-[15px] leading-snug text-white/90">{children}</span>
    </li>
  );
}

export function PatientServiceDetailSection({ section }: Props) {
  const accentClass = section.accentClass ?? "bg-[var(--teal)]";
  const accentTextClass = section.accentTextClass ?? "text-[var(--teal)]";
  const ctaHref = getServiceCtaHref(section.id);
  const showProductCards = section.id === "gestion-poids";

  return (
    <section
      id={section.id}
      className={`scroll-mt-24 border-b border-white/15 py-12 last:border-b-0 sm:py-16${
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
          className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[32px]"
        >
          {section.title}
        </h2>

        {showProductCards ? (
          <div className="relative left-1/2 mt-6 w-screen max-w-[100vw] -translate-x-1/2 px-3 sm:mt-8 sm:px-6">
            <PatientGlp1CareProcess />
          </div>
        ) : null}

        {showProductCards ? (
          <p className="mx-auto mt-6 max-w-2xl px-2 text-[15px] leading-relaxed text-white/90 sm:mt-8 sm:text-base">
            Chez MedSim, votre santé passe avant tout. Chaque ordonnance est émise uniquement par une IPS
            certifiée, après évaluation rigoureuse de votre dossier médical.
          </p>
        ) : null}

        {showProductCards ? (
          <Glp1ProductCards
            href={ELIGIBILITY_QUESTIONNAIRE_PATH}
            className="mx-auto mt-6 max-w-5xl sm:mt-8"
          />
        ) : null}

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/85 sm:mt-8 sm:text-base">
          {section.body}
        </p>

        <div className="mx-auto mt-8 max-w-md text-left sm:mt-10">
          <p className="text-center text-base font-semibold text-white">
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
          href={ctaHref}
          className="mt-6 inline-flex items-center justify-center rounded-[10px] bg-white px-5 py-2.5 text-sm font-semibold text-[#1D4D3A] shadow-sm transition hover:bg-white/95 sm:mt-8"
        >
          En savoir plus
        </Link>
      </div>
    </section>
  );
}
