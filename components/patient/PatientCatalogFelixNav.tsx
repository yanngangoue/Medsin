"use client";

import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PatientCatalogFelixNavDropdown } from "@/components/patient/PatientCatalogFelixNavDropdown";
import { PatientHubNavMenu } from "@/components/patient/PatientHubNavMenu";
import { CATALOG_FELIX_NAV_MENUS } from "@/lib/patient/catalog-felix-nav";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { ELIGIBILITY_QUESTIONNAIRE_PATH } from "@/lib/patient/promo-banner-assets";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import { PUBLIC_HERO_CTAS } from "@/lib/patient/patient-hub";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  prenom?: string;
  isConnected?: boolean;
  showAuthLinks?: boolean;
};

export function PatientCatalogFelixNav({
  prenom,
  isConnected = false,
  showAuthLinks = true,
}: Props) {
  const profileHref = isConnected ? GLP1_PATIENT_DASHBOARD_PATH : PUBLIC_HERO_CTAS.login.href;

  const menus = showAuthLinks
    ? CATALOG_FELIX_NAV_MENUS
    : CATALOG_FELIX_NAV_MENUS.map((menu) =>
        menu.id === "contact"
          ? {
              ...menu,
              items: menu.items.filter((item) => item.href !== PUBLIC_HERO_CTAS.login.href),
            }
          : menu,
      );

  return (
    <div className="relative z-30 mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/95 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-2.5">
        <Link
          href={PUBLIC_CATALOG_HOME}
          className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4D3A]"
          aria-label="Accueil MedSim"
        >
          <MedsimLogo className="text-base sm:text-lg" />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2"
          aria-label="Navigation catalogue"
        >
          {menus.map((menu) => (
            <PatientCatalogFelixNavDropdown key={menu.id} menu={menu} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isConnected && prenom ? (
            <span className="hidden text-sm font-medium text-slate-600 md:inline">
              Bonjour, {prenom}
            </span>
          ) : null}

          <Link
            href={ELIGIBILITY_QUESTIONNAIRE_PATH}
            className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-700 lg:inline-flex"
          >
            <SearchIcon />
            Recherche
          </Link>

          {showAuthLinks && !isConnected ? (
            <Link
              href={PUBLIC_HERO_CTAS.login.href}
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
            >
              Connexion
            </Link>
          ) : null}

          <Link
            href={profileHref}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label={isConnected ? "Mon espace patient" : "Connexion"}
          >
            <UserIcon />
          </Link>

          <PatientHubNavMenu showAuthLinks={showAuthLinks && !isConnected} variant="onLight" />
        </div>
      </div>
    </div>
  );
}
