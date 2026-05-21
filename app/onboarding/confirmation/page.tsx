"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { EligibilityStatus } from "@prisma/client";
import { Glp1ConfirmationPanel } from "@/components/onboarding/Glp1ConfirmationPanel";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { objectifLabel } from "@/lib/questionnaire-labels";
import { parseQuestionnaireGetResponse } from "@/lib/questionnaire-api";
import { isPublicSiteMode } from "@/lib/is-public-site";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import {
  readGlp1AnswersFromSessionStorage,
  syncGlp1DraftToServer,
} from "@/lib/patient/glp1-session-client";
import type { Glp1EligibilityAnswers } from "@/lib/patient/glp1-eligibility-questions";
import { seedGlp1SessionForResume } from "@/lib/patient/glp1-wizard-progress";

function eligibilityMessage(status: EligibilityStatus): { title: string; body: string } {
  switch (status) {
    case "ELIGIBLE":
      return {
        title: "Bonne nouvelle",
        body: "Selon notre simulation, votre profil correspond aux critères d'éligibilité GLP-1. Un professionnel confirmera votre dossier.",
      };
    case "NOT_ELIGIBLE":
      return {
        title: "Profil non éligible pour l'instant",
        body: "Selon les informations fournies, vous ne correspondez pas aux critères de simulation. Des alternatives de suivi nutritionnel restent disponibles.",
      };
    case "MEDICAL_REVIEW_REQUIRED":
      return {
        title: "Revue médicale requise",
        body: "Un médecin de l'équipe MedSim examinera votre dossier sous 48 h.",
      };
    case "PENDING":
    default:
      return {
        title: "Dossier en cours d'analyse",
        body: "Votre questionnaire a été reçu. Un professionnel examine vos réponses.",
      };
  }
}

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGlp1 = searchParams.get("service") === "gestion-poids";
  const { data: session, status } = useSession();

  const [objectif, setObjectif] = useState("—");
  const [imc, setImc] = useState("—");
  const [dateStr, setDateStr] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityStatus>("PENDING");
  const [glp1Summary, setGlp1Summary] = useState<Glp1DossierSummary | null>(null);
  const [glp1Loading, setGlp1Loading] = useState(isGlp1);
  const [glp1Syncing, setGlp1Syncing] = useState(false);
  const [glp1SyncError, setGlp1SyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGlp1 && status === "loading" && !isPublicSiteMode()) return;
    if (!isGlp1 && !isPublicSiteMode() && status === "unauthenticated") {
      router.replace("/auth/connexion");
    }
  }, [status, router, isGlp1]);

  useEffect(() => {
    if (!isGlp1) return;
    if (status === "unauthenticated") {
      router.replace("/auth/connexion?callbackUrl=/onboarding/confirmation%3Fservice%3Dgestion-poids");
      return;
    }
    if (status !== "authenticated") return;

    let cancelled = false;

    (async () => {
      setGlp1Loading(true);
      setGlp1SyncError(null);

      const draft = readGlp1AnswersFromSessionStorage();
      if (draft?.weightGoal) {
        setGlp1Syncing(true);
        const sync = await syncGlp1DraftToServer();
        setGlp1Syncing(false);
        if (!sync.ok) {
          setGlp1SyncError(sync.error ?? "Enregistrement impossible.");
        }
      }

      const res = await fetch("/api/onboarding/glp1-dossier");
      if (cancelled) return;

      if (res.ok) {
        const data = (await res.json()) as {
          submitted: boolean;
          summary: Glp1DossierSummary | null;
          answers?: Glp1EligibilityAnswers | null;
        };
        if (data.submitted && data.summary) {
          setGlp1Summary(data.summary);
          if (data.answers) {
            seedGlp1SessionForResume(data.answers);
          }
        }
      }
      setGlp1Loading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isGlp1, status, router]);

  useEffect(() => {
    if (isGlp1 || status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/questionnaire");
      if (cancelled || !res.ok) return;
      const parsed = parseQuestionnaireGetResponse(await res.json());
      if (!parsed?.questionnaire) return;
      const q = parsed.questionnaire;
      setObjectif(objectifLabel(q.objectif));
      setImc(String(q.imc));
      setEligibility(parsed.eligibility);
      const submitted = q.submittedAt ? new Date(q.submittedAt) : new Date();
      setDateStr(submitted.toLocaleDateString("fr-CA", { dateStyle: "long" }));
    })();
    return () => {
      cancelled = true;
    };
  }, [status, isGlp1]);

  const prenom = session?.user?.prenom ?? session?.user?.name ?? "";

  if (isGlp1) {
    if (status === "loading" || status === "unauthenticated" || glp1Loading) {
      return (
        <div className="mx-auto flex max-w-lg flex-1 items-center justify-center py-16 text-sm text-slate-500">
          Chargement de votre dossier…
        </div>
      );
    }

    if (!glp1Summary) {
      return (
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-16 text-center">
          <p className="text-sm text-slate-600">
            Aucun dossier GLP-1 enregistré. Complétez l&apos;évaluation pour continuer.
          </p>
          <Link
            href="/onboarding/gestion-poids/evaluation"
            className="mt-6 text-sm font-semibold text-[#1D9E75] hover:underline"
          >
            Démarrer l&apos;évaluation →
          </Link>
        </div>
      );
    }

    return (
      <Glp1ConfirmationPanel
        prenom={prenom}
        summary={glp1Summary}
        syncing={glp1Syncing}
        syncError={glp1SyncError}
      />
    );
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="mx-auto flex max-w-[480px] flex-1 items-center justify-center py-16 text-sm text-slate-500">
        Chargement…
      </div>
    );
  }

  const msg = eligibilityMessage(eligibility);

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-4 py-12 text-center">
      <div className="mb-6">
        <EligibilityBadge status={eligibility} />
      </div>

      <h1 className="text-2xl font-semibold text-slate-900">
        {msg.title}
        {prenom ? `, ${prenom}` : ""}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{msg.body}</p>

      <div className="mt-10 w-full rounded-2xl bg-slate-100 p-6 text-left text-sm text-slate-800">
        <ul className="space-y-3">
          <li>
            <span className="text-slate-500">Objectif :</span>{" "}
            <span className="font-medium">{objectif}</span>
          </li>
          <li>
            <span className="text-slate-500">IMC :</span> <span className="font-medium">{imc}</span>
          </li>
          <li>
            <span className="text-slate-500">Date :</span>{" "}
            <span className="font-medium">{dateStr}</span>
          </li>
        </ul>
      </div>

      <Link
        href="/dashboard/patient"
        className="mt-10 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-[#1D9E75] text-sm font-semibold text-white shadow-md transition hover:bg-[#178f6a]"
      >
        Accéder à mon espace patient
      </Link>

      <p className="mt-6 text-[11px] text-slate-400">
        Simulation logicielle — ne remplace pas un avis médical.
      </p>
    </div>
  );
}
