"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PatientAiCoachPanel } from "@/components/dashboard/patient-space/PatientAiCoachPanel";
import { PatientDashboardPageShell } from "@/components/dashboard/patient-space/PatientDashboardPageShell";
import { PoidsProgrammePanel } from "@/components/dashboard/patient-space/PoidsProgrammePanel";
import { PoidsProgressionPanel } from "@/components/dashboard/patient-space/PoidsProgressionPanel";
import { PoidsTabNav } from "@/components/dashboard/patient-space/PoidsTabNav";
import { DashboardSpinner } from "@/components/ui/DashboardSpinner";
import { POIDS_BRAND } from "@/lib/patient/poids-design";
import { parsePoidsTab, type PoidsTab } from "@/lib/patient/dashboard-routes";
import type { WeightCheckInPublic, WeightProgramPublic } from "@/lib/patient/weight-program";

function PoidsContent() {
  const searchParams = useSearchParams();
  const tab = parsePoidsTab(searchParams.get("tab"));
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const [program, setProgram] = useState<WeightProgramPublic | null>(null);
  const [checkIns, setCheckIns] = useState<WeightCheckInPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachRefresh, setCoachRefresh] = useState(0);

  const loadData = useCallback(async () => {
    const [progRes, checkRes] = await Promise.all([
      fetch("/api/patient/weight-program"),
      fetch("/api/patient/weight-program/check-ins"),
    ]);
    if (progRes.ok) {
      const data = (await progRes.json()) as { program?: WeightProgramPublic | null };
      setProgram(data.program ?? null);
    }
    if (checkRes.ok) {
      const data = (await checkRes.json()) as { checkIns?: WeightCheckInPublic[] };
      setCheckIns(data.checkIns ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const tabCopy: Record<PoidsTab, { title: string; description: string }> = {
    programme: {
      title: "Mon programme poids",
      description:
        "Définissez vos objectifs et enregistrez vos check-ins. Anne réagit automatiquement après chaque pesée.",
    },
    progression: {
      title: "Ma progression",
      description:
        "Visualisez votre trajectoire de poids, vos tendances et l'historique complet de vos check-ins.",
    },
    coach: {
      title: "Votre accompagnement proactif",
      description:
        "Anne analyse vos check-ins et vous guide au quotidien. Elle ne remplace pas votre IPS.",
    },
  };

  const { title, description } = tabCopy[tab];
  const maxWidth = tab === "progression" || tab === "coach" ? "4xl" : "2xl";

  return (
    <PatientDashboardPageShell
      eyebrow="Suivi poids MedSim"
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      <PoidsTabNav active={tab} />

      {checkoutSuccess && tab === "programme" ? (
        <p
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: `${POIDS_BRAND.primary}33`,
            backgroundColor: POIDS_BRAND.successBanner,
            color: POIDS_BRAND.successText,
          }}
        >
          Abonnement confirmé. Enregistrez votre première pesée pour lancer le suivi.
        </p>
      ) : null}

      {tab === "programme" ? (
        <PoidsProgrammePanel
          program={program}
          loading={loading}
          onProgramChange={setProgram}
          onCheckInComplete={() => {
            setCoachRefresh((n) => n + 1);
            void loadData();
          }}
        />
      ) : null}

      {tab === "progression" ? (
        <PoidsProgressionPanel program={program} checkIns={checkIns} loading={loading} />
      ) : null}

      {tab === "coach" ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
            Les réponses sont informatives et motivantes — toute décision médicale ou thérapeutique
            appartient à votre professionnel de santé MedSim.
          </div>
          <PatientAiCoachPanel refreshToken={coachRefresh} />
        </div>
      ) : null}
    </PatientDashboardPageShell>
  );
}

export default function PatientPoidsPage() {
  return (
    <Suspense fallback={<DashboardSpinner />}>
      <PoidsContent />
    </Suspense>
  );
}
