"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Glp1ConfirmationPanel } from "@/components/onboarding/Glp1ConfirmationPanel";
import type { Glp1DossierSummary } from "@/lib/patient/glp1-dossier";
import { GLP1_PATIENT_DASHBOARD_PATH } from "@/lib/patient/glp1-flow-routes";

function Glp1ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGlp1 = searchParams.get("service") === "gestion-poids";
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<Glp1DossierSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/connexion?callbackUrl=/onboarding/confirmation?service=gestion-poids");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !isGlp1) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/onboarding/glp1-dossier");
      if (cancelled) return;
      if (res.ok) {
        const data = (await res.json()) as { summary?: Glp1DossierSummary | null };
        setSummary(data.summary ?? null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, isGlp1]);

  const prenom = session?.user?.prenom ?? session?.user?.name ?? "";

  if (!isGlp1) {
    return <LegacyConfirmationFallback prenom={prenom} status={status} />;
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Chargement de votre dossier…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-slate-600">Aucun dossier GLP-1 trouvé.</p>
        <Link
          href="/onboarding/gestion-poids/evaluation"
          className="mt-6 inline-flex text-sm font-semibold text-[#1D9E75] hover:underline"
        >
          Commencer l&apos;évaluation
        </Link>
      </div>
    );
  }

  return (
    <Glp1ConfirmationPanel
      prenom={prenom}
      summary={summary}
    />
  );
}

/** Ancien parcours questionnaire générique (non GLP-1). */
function LegacyConfirmationFallback({
  prenom,
  status,
}: {
  prenom: string;
  status: string;
}) {
  const [objectif, setObjectif] = useState("—");
  const [imc, setImc] = useState("—");

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetch("/api/questionnaire")
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => {
        if (!q) return;
        setObjectif(q.objectif ?? "—");
        setImc(String(q.imc ?? "—"));
      })
      .catch(() => undefined);
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="py-16 text-center text-sm text-slate-500">Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-xl font-semibold">Dossier reçu{prenom ? `, ${prenom}` : ""}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Objectif : {objectif} · IMC : {imc}
      </p>
      <Link href={GLP1_PATIENT_DASHBOARD_PATH} className="mt-6 inline-block text-[#1D9E75]">
        Mon espace
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-500">Chargement…</div>}>
      <Glp1ConfirmationContent />
    </Suspense>
  );
}
