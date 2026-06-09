"use client";

import Link from "next/link";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PatientCatalogFelixNavDropdown } from "@/components/patient/PatientCatalogFelixNavDropdown";
import { PatientHubNavMenu } from "@/components/patient/PatientHubNavMenu";
import { CATALOG_FELIX_NAV_MENUS } from "@/lib/patient/catalog-felix-nav";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import { PUBLIC_HERO_CTAS } from "@/lib/patient/patient-hub";

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  /** Dans le bandeau vert hero (sans marge externe). */
  embedded?: boolean;
};

export function PatientCatalogFelixNav({
  prenom,
  isConnected = false,
  showAuthLinks = true,
  embedded = false,
}: Props) {
  const profileHref = isConnected ? GLP1_PATIENT_DASHBOARD_PATH : PUBLIC_HERO_CTAS.login.href;

  const bar = (
      <div className="mx-auto flex w-full items-center gap-1.5 overflow-visible rounded-xl border border-white/70 bg-white/95 px-2.5 py-1 shadow-md shadow-black/10 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5">
        <Link
          href={PUBLIC_CATALOG_HOME}
          className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4D3A]"
          aria-label="Accueil MedSim"
        >
          <MedsimLogo />
        </Link>

        <nav
          className="hidden min-w-0 items-center gap-0.5 sm:flex sm:ml-1 md:ml-2 md:gap-1"
          aria-label="Navigation catalogue"
        >
          {CATALOG_FELIX_NAV_MENUS.map((menu) => (
            <PatientCatalogFelixNavDropdown key={menu.id} menu={menu} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {isConnected && prenom ? (
            <span className="hidden text-xs font-medium text-slate-600 md:inline">
              Bonjour, {prenom}
            </span>
          ) : null}

          <Link
            href={profileHref}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label={isConnected ? "Mon espace patient" : "Connexion"}
          >
            <UserIcon />
          </Link>

          <PatientHubNavMenu showAuthLinks={showAuthLinks && !isConnected} variant="onLight" />
        </div>
      </div>
  );

  if (embedded) {
    return bar;
  }

  return (
    <div className="relative z-30 px-2 pt-2 sm:px-3 sm:pt-3">
      {bar}
    </div>
  );
}
