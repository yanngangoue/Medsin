"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/role-portal/SignOutButton";
import { MedsimLogo } from "@/components/MedsimLogo";
import { PartNavAccueilLink } from "@/components/patient/PartNavAccueilLink";
import { PatientHubNavMenu } from "@/components/patient/PatientHubNavMenu";
import { PatientHubServicesGrid } from "@/components/patient/PatientHubServicesGrid";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";
import { PUBLIC_CATALOG_HOME } from "@/lib/public-catalog";
import {
  PUBLIC_HERO_CTAS,
  buildPatientHubActions,
  type PatientHubContext,
} from "@/lib/patient/patient-hub";

type Props = {
  prenom?: string;
  showAuthLinks?: boolean;
  variant?: "public" | "connected";
  hubContext?: PatientHubContext;
  /** Nav déjà affichée au-dessus (accueil connecté) */
  hideTopNav?: boolean;
  /** Cartes → scroll vers les sections détaillées sur l’accueil */
  useSectionAnchors?: boolean;
};

export function PatientServicesHub({
  prenom,
  showAuthLinks = true,
  variant = "public",
  hubContext = { hasQuestionnaire: false, eligibility: "PENDING" },
  hideTopNav = false,
  useSectionAnchors = false,
}: Props) {
  const isConnected = variant === "connected";
  const services = buildPatientHubActions(hubContext);

  return (
    <section
      id="patient-services-hub"
      className="relative overflow-hidden bg-[var(--teal-900)] pb-10 pt-6 sm:pb-14 sm:pt-8"
      aria-labelledby="patient-services-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--teal)]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {!hideTopNav ? (
          <div className="flex items-center justify-between gap-4">
            <Link
              href={PUBLIC_CATALOG_HOME}
              className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Accueil — catalogue des services"
            >
              <MedsimLogo variant="onDark" className="text-xl sm:text-2xl" />
            </Link>
            <div className="flex items-center gap-3 sm:gap-5">
              {!isConnected ? <PartNavAccueilLink variant="onDark" /> : null}
              {showAuthLinks && !isConnected ? (
                <Link
                  href={PUBLIC_HERO_CTAS.login.href}
                  className="hidden text-sm font-medium text-white/90 hover:text-white sm:inline"
                >
                  Connexion
                </Link>
              ) : null}
              {isConnected ? (
                <>
                  <Link
                    href={GLP1_PATIENT_DASHBOARD_PATH}
                    className="hidden rounded-lg bg-white px-4 py-2 text-sm font-bold text-[var(--teal-900)] shadow-sm transition hover:bg-white/95 sm:inline-flex"
                  >
                    Mon espace
                  </Link>
                  <SignOutButton
                    callbackUrl={PUBLIC_CATALOG_HOME}
                    className="hidden text-sm font-medium text-white/90 hover:text-white sm:inline"
                  />
                </>
              ) : null}
              <PatientHubNavMenu showAuthLinks={showAuthLinks && !isConnected} />
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-5 max-w-2xl text-center sm:mt-6">
          {isConnected && prenom ? (
            <p className="text-sm font-medium text-white/90">Bonjour, {prenom}</p>
          ) : (
            <p className="text-sm font-medium leading-snug text-white/90 sm:text-base">
              Transformez vos objectifs en résultats avec MedSim
            </p>
          )}
          <h1
            id="patient-services-heading"
            className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-white sm:mt-3 sm:text-[36px]"
          >
            {isConnected ? "Vos parcours de santé" : "Une nouvelle façon de vivre les soins de santé"}
          </h1>
          {isConnected ? (
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85">
              Choisissez un service pour continuer votre suivi ou consulter votre dossier.
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85">
              Découvrez nos services librement. Créez un compte pour démarrer votre parcours personnalisé.
            </p>
          )}
        </div>

        {isConnected ? (
          <div className="relative z-10 mx-auto mt-6 flex max-w-md flex-col gap-3 sm:mt-8 sm:max-w-lg sm:flex-row sm:justify-center">
            <Link
              href={GLP1_PATIENT_DASHBOARD_PATH}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[var(--teal-900)] shadow-md transition hover:bg-white/95"
            >
              Mon espace patient
            </Link>
            <Link
              href="#patient-services-hub"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Explorer les services
            </Link>
          </div>
        ) : null}

        {!isConnected ? (
          <div className="relative z-10 mx-auto mt-6 flex max-w-md justify-center sm:mt-8 sm:max-w-lg">
            <Link
              href={PUBLIC_HERO_CTAS.start.href}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[var(--teal-900)] shadow-md transition hover:bg-white/95"
            >
              {PUBLIC_HERO_CTAS.start.label}
            </Link>
          </div>
        ) : null}

        <PatientHubServicesGrid
          services={services}
          mode={isConnected ? "connected" : "public"}
          useSectionAnchors={useSectionAnchors}
        />
      </div>
    </section>
  );
}
