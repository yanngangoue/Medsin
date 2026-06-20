"use client";

import { PatientCatalogFelixNav } from "@/components/patient/PatientCatalogFelixNav";
import { PatientHubServicesGrid } from "@/components/patient/PatientHubServicesGrid";
import { buildPatientHubActions, type PatientHubContext } from "@/lib/patient/patient-hub";

type Props = {
  prenom?: string;
  showAuthLinks?: boolean;
  variant?: "public" | "connected";
  hubContext?: PatientHubContext;
  hideTopNav?: boolean;
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
  const heroWithEmbeddedNav = services.length === 1 && useSectionAnchors;

  const nav = (
    <PatientCatalogFelixNav
      prenom={prenom}
      isConnected={isConnected}
      showAuthLinks={showAuthLinks}
      embedded={heroWithEmbeddedNav}
    />
  );

  return (
    <section
      id="patient-services-hub"
      className="relative overflow-x-hidden pb-2 sm:pb-3"
      aria-label="Accueil GLP-1 Anne-sante"
    >
      <h1 className="sr-only">Anne-sante — parcours GLP-1 au Québec</h1>

      {!hideTopNav && !heroWithEmbeddedNav ? nav : null}

      <div
        className={
          heroWithEmbeddedNav
            ? "relative"
            : "relative mx-auto max-w-6xl px-4 sm:px-6"
        }
      >
        <PatientHubServicesGrid
          services={services}
          mode={isConnected ? "connected" : "public"}
          useSectionAnchors={useSectionAnchors}
          heroTopNav={!hideTopNav && heroWithEmbeddedNav ? nav : undefined}
        />
      </div>
    </section>
  );
}
