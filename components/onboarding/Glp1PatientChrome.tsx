"use client";

import { useSession } from "next-auth/react";
import { Glp1FlowBreadcrumb } from "@/components/onboarding/Glp1FlowBreadcrumb";
import { PatientNavSubBar } from "@/components/patient/PatientNav";
import { usePatientNotifications } from "@/lib/patient/use-patient-notifications";

/** Fil d'Ariane + nav patient sous l'en-tête GLP-1 (si connecté). */
export function Glp1PatientChrome({ hasGlp1Dossier }: { hasGlp1Dossier?: boolean }) {
  const { data: session, status } = useSession();
  const { hasGlp1Dossier: fromApi } = usePatientNotifications(status === "authenticated");

  if (status !== "authenticated" || session?.user?.role !== "PATIENT") {
    return null;
  }

  const dossier = hasGlp1Dossier ?? fromApi;

  return (
    <>
      <Glp1FlowBreadcrumb />
      <PatientNavSubBar hasGlp1Dossier={dossier} />
    </>
  );
}
