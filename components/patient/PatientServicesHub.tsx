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

  return (
    <section
      id="patient-services-hub"
      className="relative overflow-x-hidden pb-12 sm:pb-16"
      aria-label="Accueil GLP-1 MedSim"
    >
      <h1 className="sr-only">MedSim — parcours GLP-1 au Québec</h1>

      {!hideTopNav ? (
        <PatientCatalogFelixNav
          prenom={prenom}
          isConnected={isConnected}
          showAuthLinks={showAuthLinks}
        />
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <PatientHubServicesGrid
          services={services}
          mode={isConnected ? "connected" : "public"}
          useSectionAnchors={useSectionAnchors}
        />
      </div>
    </section>
  );
}
