"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

type Step = { label: string; sublabel: string; done: boolean; active: boolean };

function buildSteps(qStatus: string | undefined): Step[] {
  const submitted = !!qStatus;
  const underReview = qStatus === "UNDER_REVIEW" || qStatus === "PRESCRIPTION_ISSUED" || qStatus === "APPROVED";
  const prescribed = qStatus === "PRESCRIPTION_ISSUED" || qStatus === "APPROVED";

  return [
    {
      label: "Questionnaire soumis",
      sublabel: "Votre dossier médical a été reçu",
      done: submitted,
      active: submitted && !underReview,
    },
    {
      label: "Examen IPS en cours",
      sublabel: "Un professionnel de santé examine votre dossier",
      done: underReview,
      active: underReview && !prescribed,
    },
    {
      label: "Ordonnance émise",
      sublabel: "Votre médicament GLP-1 est prescrit",
      done: prescribed,
      active: prescribed,
    },
    {
      label: "Paiement & livraison",
      sublabel: "Traitement préparé et expédié sous 24h",
      done: false,
      active: false,
    },
  ];
}

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D4D3A]">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
          <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (active) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#3EBD93] bg-white">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#3EBD93]" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
    </span>
  );
}

export function ExamenEnCoursPanel() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/dashboard");
      const payload = (await res.json().catch(() => ({}))) as DashboardPayload & { error?: string };
      if (!res.ok) { setError(payload.error ?? "Impossible de charger le statut."); return; }
      setData(payload);
      setError(null);
    } catch {
      setError("Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const qStatus = data?.questionnaire?.status;
  const fulfillment = data?.fulfillment;
  const paymentReady =
    fulfillment?.paymentStatus === "PENDING" &&
    (qStatus === "PRESCRIPTION_ISSUED" || qStatus === "APPROVED");

  /* ── Paiement prêt ─────────────────────────────────────────── */
  if (paymentReady && fulfillment) {
    return (
      <div className="q-enter-forward mx-auto max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-[#3EBD93]/30 bg-white shadow-xl">
          {/* Header vert */}
          <div className="bg-gradient-to-br from-[#1D4D3A] to-[#163d2e] px-8 py-7 text-center">
            <span className="text-4xl">🎉</span>
            <h1 className="mt-3 font-display text-2xl font-bold text-white">Ordonnance approuvée !</h1>
            <p className="mt-2 text-sm text-white/75">Votre IPS a validé votre dossier</p>
          </div>

          <div className="px-8 py-7">
            {/* Résumé */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Médicament prescrit</p>
              <p className="mt-1 font-display text-xl font-bold text-[#1D4D3A]">{fulfillment.medication}</p>
            </div>

            <p className="mt-5 text-center text-sm leading-relaxed text-slate-600">
              Finalisez votre paiement pour que la pharmacie prépare et expédie votre traitement sous 24 h.
            </p>

            <Link
              href={`/paiement?fulfillment=${fulfillment.id}`}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-base font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              Payer et lancer ma livraison
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </Link>

            <p className="mt-3 text-center text-xs text-slate-400">
              Paiement sécurisé Stripe · Annulable en tout temps
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Dossier refusé ─────────────────────────────────────────── */
  if (qStatus === "REJECTED") {
    return (
      <div className="q-enter-forward mx-auto max-w-lg rounded-3xl border border-orange-100 bg-white p-8 shadow-xl text-center">
        <span className="text-4xl">💙</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Votre santé reste prioritaire</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Le traitement GLP-1 n&apos;a pas été retenu pour l&apos;instant. Ce n&apos;est pas un refus définitif —
          consultez votre IPS via l&apos;espace patient pour en savoir plus et explorer les alternatives.
        </p>
        <Link href="/dashboard/patient" className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] px-6 text-sm font-bold text-white shadow-md">
          Mon espace patient
        </Link>
      </div>
    );
  }

  /* ── État de chargement ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-4 inline-flex h-10 items-center rounded-2xl border-2 border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:border-slate-300">
          Réessayer
        </button>
      </div>
    );
  }

  /* ── En cours d'examen (état principal) ─────────────────────── */
  const steps = buildSteps(qStatus);
  const activeStep = steps.findIndex((s) => s.active);

  return (
    <div className="q-enter-forward mx-auto max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-100 px-8 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3EBD93]">En cours</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Votre dossier est en révision
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Une IPS Anne-sante examine votre questionnaire. Délai habituel : <strong className="text-slate-700">24–48 heures</strong>.
          </p>
        </div>

        {/* Timeline steps */}
        <div className="px-8 py-6">
          <div className="relative space-y-0">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                {/* Colonne icône + ligne */}
                <div className="flex flex-col items-center">
                  <StepIcon done={step.done} active={step.active} />
                  {i < steps.length - 1 && (
                    <div className={`mt-1 mb-1 w-0.5 flex-1 min-h-[28px] rounded-full transition-colors ${step.done ? "bg-[#1D4D3A]" : "bg-slate-100"}`} />
                  )}
                </div>

                {/* Contenu */}
                <div className={`pb-6 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                  <p className={`text-sm font-semibold ${step.done ? "text-[#1D4D3A]" : step.active ? "text-slate-900" : "text-slate-400"}`}>
                    {step.label}
                    {step.active && <span className="ml-2 inline-flex items-center rounded-full bg-[#F0F7F4] px-2 py-0.5 text-[10px] font-bold text-[#1D4D3A]">En cours</span>}
                  </p>
                  <p className={`mt-0.5 text-xs ${step.done || step.active ? "text-slate-500" : "text-slate-300"}`}>
                    {step.sublabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50 px-8 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-base">💬</span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Vous serez notifié par courriel</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Dès que votre IPS aura rendu sa décision. Anne peut répondre à vos questions en attendant.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/patient/coach-ia"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-xs font-bold text-white shadow-sm transition hover:shadow-md"
            >
              Parler à Anne
            </Link>
            <Link
              href="/dashboard/patient"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Mon espace patient
            </Link>
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-400">
            Mise à jour automatique · {activeStep >= 0 ? `Étape ${activeStep + 1}/4 en cours` : "En attente"}
          </p>
        </div>
      </div>
    </div>
  );
}
