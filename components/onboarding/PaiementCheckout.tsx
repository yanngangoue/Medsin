"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FulfillmentSummary = {
  id: string;
  medication: string;
  dosage: string;
  amountCents: number;
  priceLabel: string;
  paymentStatus: string;
  ipsName: string;
};

function formatAmount(cents: number): string {
  return `${(cents / 100).toFixed(0)} $`;
}

/* ── Succès paiement ─────────────────────────────────────────── */
function SuccessPanel({ onboarding }: { onboarding?: boolean }) {
  return (
    <div className="q-enter-forward mx-auto max-w-md py-4">
      {/* Carte succès */}
      <div className="overflow-hidden rounded-3xl border border-[#3EBD93]/30 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-[#1D4D3A] to-[#0f2919] px-8 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
              <circle cx="24" cy="24" r="22" stroke="#3EBD93" strokeWidth="2.5" className="medsim-check-circle" />
              <path d="M14 24l7 7 13-14" stroke="#3EBD93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="medsim-check-mark" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Paiement confirmé !</h1>
          <p className="mt-1 text-sm text-white/70">
            {onboarding
              ? "Votre abonnement Anne-sante GLP-1 est actif"
              : "Bienvenue dans le programme Anne-sante GLP-1"}
          </p>
        </div>

        <div className="px-8 py-7">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Ce qui se passe maintenant</p>
          <div className="space-y-3">
            {(onboarding
              ? [
                  { icon: "📋", title: "Questionnaire médical", body: "Complétez votre dossier en 5 minutes" },
                  { icon: "👩‍⚕️", title: "Examen IPS", body: "Réponse sous 48 h ouvrables" },
                  { icon: "🤖", title: "Coach Anne", body: "Suivi personnalisé dès la livraison" },
                ]
              : [
                  { icon: "💊", title: "Pharmacie notifiée", body: "Votre médicament est en cours de préparation" },
                  { icon: "📦", title: "Livraison sous 1–3 jours", body: "Suivi de colis disponible dans votre espace patient" },
                  { icon: "🤖", title: "Anne vous contacte", body: "Votre coach IA démarre votre suivi hebdomadaire" },
                ]
            ).map((step) => (
              <div key={step.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-lg">{step.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="text-xs text-slate-500">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={onboarding ? "/questionnaire" : "/dashboard/patient"}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
          >
            {onboarding ? "Commencer le questionnaire" : "Accéder à mon espace patient"}
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Checkout principal ─────────────────────────────────────── */
export function PaiementCheckout() {
  const searchParams = useSearchParams();
  const fulfillmentParam = searchParams.get("fulfillment");
  const cancelled = searchParams.get("cancelled") === "1";
  const paid = searchParams.get("paid") === "1";
  const testMode = process.env.NEXT_PUBLIC_TEST_MODE === "true";

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<FulfillmentSummary | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(fulfillmentParam);

  const loadFulfillment = useCallback(async () => {
    setFetching(true);
    setError(null);

    const id = fulfillmentParam;
    if (!id) {
      setFetching(false);
      setError("Lien de paiement invalide. Consultez le courriel reçu après approbation IPS.");
      return;
    }
    setResolvedId(id);

    const res = await fetch(`/api/patient/fulfillment/${id}`);
    if (!res.ok) { setFetching(false); setError("Impossible de charger votre ordonnance."); return; }

    const data = (await res.json()) as FulfillmentSummary;
    setFulfillment(data);
    setFetching(false);
  }, [fulfillmentParam]);

  useEffect(() => { void loadFulfillment(); }, [loadFulfillment]);

  async function payer() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentId: resolvedId, purpose: "fulfillment" }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    setLoading(false);
    if (!res.ok || !data.url) { setError(data.error ?? "Impossible de démarrer le paiement. Réessayez."); return; }
    window.location.href = data.url;
  }

  async function simulerPaiement() {
    if (!resolvedId) return;
    setSimulating(true);
    setError(null);
    const res = await fetch("/api/payment/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentId: resolvedId }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSimulating(false);
    if (!res.ok) {
      setError(data.error ?? "Simulation impossible.");
      return;
    }
    window.location.href = `/paiement?paid=1&fulfillment=${encodeURIComponent(resolvedId)}`;
  }

  if (paid) return <SuccessPanel onboarding={false} />;

  if (fetching) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const amountLabel = fulfillment ? formatAmount(fulfillment.amountCents) : "149,99 $";

  return (
    <div className="mx-auto max-w-2xl">
      {/* En-tête */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#3EBD93]">Dernière étape</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
          Compléter mon abonnement GLP-1
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          149,99 $/mois — votre IPS a approuvé votre dossier. Le médicament sera préparé dès confirmation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Résumé commande */}
        <div className="space-y-4">
          {cancelled && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Paiement annulé</p>
                <p className="text-xs text-amber-800">Aucun montant n&apos;a été débité. Vous pouvez réessayer.</p>
              </div>
            </div>
          )}

          {/* Ordonnance / programme */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Votre ordonnance
            </p>
            {fulfillment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl bg-[#F0F7F4] px-4 py-3">
                  <span className="text-2xl">💊</span>
                  <div>
                    <p className="font-display text-lg font-bold text-[#1D4D3A]">{fulfillment.medication}</p>
                    <p className="text-sm text-slate-600">Dose : {fulfillment.dosage}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Prescrit par </span>{fulfillment.ipsName}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{error}</p>
            )}
          </div>

          {/* Détail prix */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Détail de l&apos;abonnement</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Médicament GLP-1</span>
                <span className="font-semibold text-slate-900">{amountLabel}/mois</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Suivi Anne (coach IA)</span>
                <span className="font-semibold text-emerald-600">Inclus ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Livraison discrète</span>
                <span className="font-semibold text-emerald-600">Incluse ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Consultations IPS de suivi</span>
                <span className="font-semibold text-emerald-600">Incluses ✓</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                <span>Total mensuel</span>
                <span>{amountLabel}/mois</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Abonnement mensuel · Annulable en tout temps · Sans frais d&apos;annulation</p>
          </div>

          {/* Garanties */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🔒", label: "Stripe sécurisé" },
              { icon: "🍁", label: "Conforme Loi 25" },
              { icon: "↩️", label: "Remboursé si refusé" },
            ].map((g) => (
              <div key={g.label} className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                <span className="text-xl">{g.icon}</span>
                <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-600">{g.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA paiement — sticky */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-end justify-between">
              <span className="text-sm text-slate-500">Montant</span>
              <span className="font-display text-3xl font-bold text-slate-900">{amountLabel}<span className="text-base font-medium text-slate-400">/mois</span></span>
            </div>

            <button
              type="button"
              disabled={loading || !fulfillment || fulfillment.paymentStatus === "PAID"}
              onClick={() => void payer()}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D4D3A] to-[#163d2e] text-base font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Redirection…</>
              ) : cancelled ? (
                <>Réessayer le paiement <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
              ) : (
                <>Payer maintenant <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></>
              )}
            </button>

            {fulfillment?.paymentStatus === "PAID" && (
              <p className="mt-4 text-center text-sm font-medium text-emerald-600">
                ✓ Cette ordonnance est déjà payée.{" "}
                <Link href="/dashboard/patient" className="font-bold underline">Mon espace</Link>
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {testMode ? (
              <button
                type="button"
                disabled={simulating || !fulfillment || fulfillment.paymentStatus === "PAID"}
                onClick={() => void simulerPaiement()}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                {simulating ? "Simulation…" : "Simuler paiement (test)"}
              </button>
            ) : null}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/></svg>
              Paiement traité par Stripe
            </div>

            <p className="mt-4 text-center text-xs">
              <Link href="/dashboard/patient" className="font-semibold text-slate-500 hover:text-[#1D4D3A] hover:underline">
                ← Retourner à mon espace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
