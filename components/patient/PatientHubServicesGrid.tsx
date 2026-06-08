import Link from "next/link";
import type { ReactNode } from "react";
import { HoverZoomImage } from "@/components/ui/HoverZoomImage";
import { Glp1PromoBanner } from "@/components/patient/Glp1PromoBanner";
import type { buildPatientHubActions } from "@/lib/patient/patient-hub";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";
import { getServiceSectionAnchor } from "@/lib/patient/service-landing-paths";

type HubItem = ReturnType<typeof buildPatientHubActions>[number];

type Props = {
  services: HubItem[];
  /** Cartes publiques : lien « Découvrir » ; hub connecté : statut + action */
  mode: "public" | "connected";
  /** Accueil : cartes → sections détaillées (#gestion-poids, etc.) */
  useSectionAnchors?: boolean;
  /** Nav blanche intégrée au bandeau hero */
  heroTopNav?: ReactNode;
};

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PatientHubServicesGrid({
  services,
  mode,
  useSectionAnchors = false,
  heroTopNav,
}: Props) {
  if (services.length === 1 && useSectionAnchors) {
    return (
      <div className="relative z-10 w-full px-3 pt-2 sm:px-5 sm:pt-3 md:px-6">
        <Glp1PromoBanner href={ELIGIBILITY_QUESTIONNAIRE_PATH} topNav={heroTopNav} />
      </div>
    );
  }

  return (
    <ul
      className={`relative z-10 mt-8 grid gap-4 sm:mt-10 sm:gap-5 ${
        services.length === 1 ? "max-w-md sm:grid-cols-1" : "sm:grid-cols-3"
      }`}
    >
      {services.map((service) => {
        const isLocalImage = service.image.startsWith("/");
        const href = useSectionAnchors
          ? getServiceSectionAnchor(service.id)
          : mode === "public"
            ? service.discoverHref
            : service.action.href;
        const footerLabel =
          mode === "public"
            ? useSectionAnchors
              ? "En savoir plus"
              : "Découvrir"
            : service.action.ctaLabel;

        return (
          <li key={service.id} className="h-full">
            <Link
              href={href}
              aria-label={`${service.title} — ${footerLabel}`}
              className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <HoverZoomImage
                src={service.image}
                alt={service.imageAlt}
                fill
                unoptimized={isLocalImage}
                zoom="default"
                groupHover
                clickable
                containerClassName={`aspect-[4/3] w-full shrink-0 ${service.panelClass}`}
                imageClassName="object-cover object-center"
                sizes="(max-width: 640px) 90vw, 320px"
              />
              <div className="flex flex-col gap-1 border-t border-slate-100 px-4 py-3">
                {mode === "connected" ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1D9E75]">
                    {service.action.statusLabel}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">{service.subtitle}</span>
                )}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[16px] font-bold text-slate-900">{service.title}</p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[var(--teal)] group-hover:text-white">
                    <ArrowIcon />
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">{footerLabel} →</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
