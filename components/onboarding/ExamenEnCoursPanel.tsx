"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { dsBtnPrimary, dsBtnSecondary, dsCard } from "@/lib/design-system";

type DashboardPayload = {
  questionnaire: { id: string; status: string; updatedAt: string } | null;
  fulfillment: {
    id: string;
    medication: string;
    paymentStatus: string;
    status: string;
  } | null;
};

const POLL_MS = 30_000;

function statusLabel(status: string | undefined): string {
  switch (status) {
    case "SUBMITTED":
      return "Dossier reçu";
    case "UNDER_REVIEW":
      return "Examen en cours par l'IPS";
    case "PRESCRIPTION_ISSUED":
      return "Ordonnance prête";
    case "APPROVED":
      return "Dossier approuvé";
    case "REJECTED":
      return "Dossier refusé";
    default:
      return "En attente";
  }
}

export function ExamenEnCoursPanel() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/dashboard");
      const payload = (await res.json().catch(() => ({}))) as DashboardPayload & {
        error?: string;
      };
      if (!res.ok) {
        setError(payload.error ?? "Impossible de charger le statut de votre dossier.");
        return;
      }
      setData(payload);
      setError(null);
    } catch {
      setError("Impossible de charger le statut de votre dossier. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <p className="text-sm text-[#6B7280]">Chargement du statut de votre dossier…</p>
        <div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#3EBD93]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${dsCard} mx-auto max-w-lg text-center`}>
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => void load()} className={`mt-4 ${dsBtnSecondary}`}>
          Réessayer
        </button>
      </div>
    );
  }

  const qStatus = data?.questionnaire?.status;
  const fulfillment = data?.fulfillment;
  const paymentReady =
    fulfillment?.paymentStatus === "PENDING" &&
    (qStatus === "PRESCRIPTION_ISSUED" || qStatus === "APPROVED");

  if (qStatus === "REJECTED") {
    return (
      <div className={`${dsCard} mx-auto max-w-lg border-orange-100 bg-[#FFF7ED] text-center`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#EA580C]">
          Dossier non retenu
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[#1A1A2E]">
          Votre IPS a examiné votre dossier
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          Le traitement GLP-1 n&apos;a pas été retenu pour le moment. Consultez votre IPS via
          l&apos;espace patient pour plus de détails.
        </p>
        <Link href="/dashboard/patient" className={`mt-8 ${dsBtnPrimary}`}>
          Mon espace patient
        </Link>
      </div>
    );
  }

  if (paymentReady && fulfillment) {
    return (
      <div className={`${dsCard} mx-auto max-w-lg border-emerald-200 bg-[#F0FDF4] text-center`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#10B981]">
          Ordonnance prête
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[#1A1A2E]">
          Votre ordonnance est prête
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
          Votre IPS a approuvé votre dossier pour <strong>{fulfillment.medication}</strong>.
          Procédez au paiement pour lancer la livraison.
        </p>
        <Link
          href={`/paiement?fulfillment=${fulfillment.id}`}
          className={`mt-8 inline-flex h-14 items-center ${dsBtnPrimary}`}
        >
          Payer et lancer ma livraison →
        </Link>
        <Link href="/dashboard/patient" className={`mt-4 block text-sm text-[#1D4D3A] underline`}>
          Retour à mon espace
        </Link>
      </div>
    );
  }

  const progressPct =
    qStatus === "UNDER_REVIEW" ? 66 : qStatus === "SUBMITTED" ? 40 : 25;

  return (
    <div className={`${dsCard} mx-auto max-w-lg text-center`}>
      <p className="text-4xl" aria-hidden>
        📋
      </p>
      <h1 className="mt-4 text-2xl font-bold text-[#1A1A2E]">
        Votre dossier est en cours d&apos;examen
      </h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#1D4D3A]">
        {statusLabel(qStatus)}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        Une infirmière praticienne spécialisée (IPS) MedSim examine votre questionnaire. Réponse
        habituelle sous <strong>48 heures</strong>. Cette page se met à jour automatiquement.
      </p>

      <div className="mt-8">
        <div className="flex justify-between text-xs font-medium text-[#6B7280]">
          <span>Progression</span>
          <span>{progressPct} %</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#3EBD93] transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[#6B7280]">
          Actualisation automatique toutes les 30 secondes
        </p>
      </div>

      <Link href="/dashboard/patient" className={`mt-8 ${dsBtnPrimary}`}>
        Accéder à mon espace
      </Link>
    </div>
  );
}
