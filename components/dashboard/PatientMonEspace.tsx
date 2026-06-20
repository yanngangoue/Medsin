"use client";

import { useEffect, useState } from "react";
import type { EligibilityStatus } from "@prisma/client";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import { buildPatientJourneySimple } from "@/lib/patient/patient-space";
import { PatientGlp1DossierCard } from "@/components/dashboard/patient-space/PatientGlp1DossierCard";
import { PatientPrescriptionCard } from "@/components/dashboard/patient-space/PatientPrescriptionCard";
import { PatientDashboardQuickNav } from "@/components/dashboard/patient-space/PatientDashboardQuickNav";
import { PatientWeightProgramCard } from "@/components/dashboard/patient-space/PatientWeightProgramCard";
import { PatientAiCoachPanel } from "@/components/dashboard/patient-space/PatientAiCoachPanel";
import { PatientJourneyStrip } from "@/components/dashboard/patient-space/PatientJourneyStrip";
import { PatientCareHub } from "@/components/dashboard/patient-space/PatientCareHub";
import { PatientSpaceShell } from "@/components/dashboard/patient-space/PatientSpaceShell";

type Props = {
  prenom: string;
  email: string;
  userId: string;
  eligibility: EligibilityStatus;
  hasGlp1Dossier: boolean;
  glp1Summary: Glp1DossierSummary | null;
};

export function PatientMonEspace({
  prenom,
  email,
  userId,
  eligibility,
  hasGlp1Dossier,
  glp1Summary,
}: Props) {
  const [staffId, setStaffId] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const journey = buildPatientJourneySimple(hasGlp1Dossier, eligibility);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/messages/staff-contact");
      if (res.ok) {
        const data = (await res.json()) as { peer: { id: string } | null };
        setStaffId(data.peer?.id ?? null);
      }
      setMessagesLoading(false);
    })();
  }, []);

  return (
    <PatientSpaceShell prenom={prenom} email={email} hasGlp1Dossier={hasGlp1Dossier}>
      <div className="patient-space-enter space-y-8">
        <PatientJourneyStrip steps={journey} />

        <PatientDashboardQuickNav />

        <PatientPrescriptionCard />

        <PatientWeightProgramCard />

        <PatientAiCoachPanel compact />

        <PatientGlp1DossierCard
          eligibility={eligibility}
          hasGlp1Dossier={hasGlp1Dossier}
          glp1Summary={glp1Summary}
        />

        <PatientCareHub
          userId={userId}
          staffId={staffId}
          messagesLoading={messagesLoading}
        />

        <p className="rounded-xl border border-slate-200/60 bg-white/60 px-4 py-4 text-center text-[11px] leading-relaxed text-slate-500">
          Anne-sante est une plateforme de télésanté et de simulation. Les informations affichées ne
          constituent pas un avis médical. Toute prescription est validée par un professionnel
          autorisé au Québec.
        </p>
      </div>
    </PatientSpaceShell>
  );
}
