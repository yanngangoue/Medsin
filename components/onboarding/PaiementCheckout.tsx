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

export function PaiementCheckout() {
  const searchParams = useSearchParams();
  const fulfillmentParam = searchParams.get("fulfillment");
  const cancelled = searchParams.get("cancelled") === "1";
  const paid = searchParams.get("paid") === "1";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<FulfillmentSummary | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(fulfillmentParam);

  const loadFulfillment = useCallback(async () => {
    setFetching(true);
    setError(null);

    let id = fulfillmentParam;

    if (!id) {
      const listRes = await fetch("/api/patient/fulfillment");
      if (listRes.ok) {
        const list = (await listRes.json()) as {
          fulfillment?: { id: string; paymentStatus: string } | null;
        };
        if (list.fulfillment?.paymentStatus === "PENDING") {
          id = list.fulfillment.id;
        }
      }
    }

    if (!id) {
      setFetching(false);
      setError("Aucune ordonnance en attente de paiement. Vérifiez le lien reçu par courriel.");
      return;
    }

    setResolvedId(id);

    const res = await fetch(`/api/patient/fulfillment/${id}`);
    if (!res.ok) {
      setFetching(false);
      setError("Impossible de charger votre ordonnance.");
      return;
    }

    const data = (await res.json()) as FulfillmentSummary;
    setFulfillment(data);
    setFetching(false);

    if (data.paymentStatus === "PAID" && !paid) {
      setError(null);
    }
  }, [fulfillmentParam, paid]);

  useEffect(() => {
    void loadFulfillment();
  }, [loadFulfillment]);

  async function payer() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resolvedId ? { fulfillmentId: resolvedId } : {}),
    });

    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    setLoading(false);

    if (!res.ok || !data.url) {
      setError(data.error ?? "Impossible de démarrer le paiement");
      return;
    }

    window.location.href = data.url;
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <div className="rounded-2xl border border-[#3EBD93]/30 bg-[#3EBD93]/10 p-8">
          <p className="text-3xl" aria-hidden>
            ✅
          </p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Paiement confirmé !</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Votre médicament est en cours de préparation.
            <br />
            Anne vous contacte sous peu.
          </p>
          <Link
            href="/dashboard/patient?paid=1"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#1D4D3A] px-6 text-sm font-semibold text-white hover:bg-[#163d2e]"
          >
            Accéder à mon espace →
          </Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">Chargement de votre ordonnance…</p>
    );
  }

  const amountLabel = fulfillment ? formatAmount(fulfillment.amountCents) : "—";

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gauche — résumé */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#3EBD93]">Étape finale</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Résumé de commande</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {fulfillment ? (
            <>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Médicament prescrit
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{fulfillment.medication}</p>
                  <p className="text-slate-600">Dose : {fulfillment.dosage}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IPS prescriptrice
                  </p>
                  <p className="mt-1 font-medium text-slate-800">{fulfillment.ipsName}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900">Programme MedSim — Abonnement mensuel</p>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Prix médicament</span>
                  <span className="font-semibold text-slate-900">{amountLabel}/mois</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Suivi Anne inclus</span>
                  <span className="font-semibold text-[#10B981]">Gratuit ✓</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Livraison</span>
                  <span className="font-semibold text-[#10B981]">Gratuite ✓</span>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{amountLabel}/mois</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Annulable en tout temps</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">{error}</p>
          )}
        </div>

        <ul className="space-y-2 text-sm text-slate-600">
          <li>🔒 Paiement sécurisé Stripe</li>
          <li>🔒 Données chiffrées Loi 25</li>
          <li>↩️ Remboursement si non éligible</li>
        </ul>
      </div>

      {/* Droite — paiement */}
      <div className="flex flex-col justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {cancelled ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Paiement annulé — réessayer ?</p>
              <p className="mt-1 text-sm text-amber-800">
                Aucun montant n&apos;a été débité sur votre carte.
              </p>
            </div>
          ) : null}

          <h2 className="text-xl font-bold text-slate-900">Finaliser mon abonnement</h2>
          <p className="mt-2 text-sm text-slate-600">
            Vous serez redirigé·e vers Stripe pour un paiement sécurisé par carte.
          </p>

          <button
            type="button"
            disabled={loading || !fulfillment || fulfillment.paymentStatus === "PAID"}
            onClick={() => void payer()}
            className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-[#3EBD93] text-base font-bold text-white transition-colors hover:bg-[#35a882] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Redirection vers Stripe…"
              : cancelled
                ? `Réessayer — ${amountLabel}/mois →`
                : `Payer ${amountLabel}/mois →`}
          </button>

          {fulfillment?.paymentStatus === "PAID" ? (
            <p className="mt-4 text-sm font-medium text-[#10B981]">
              Cette ordonnance est déjà payée.{" "}
              <Link href="/dashboard/patient" className="underline">
                Mon espace
              </Link>
            </p>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/dashboard/patient" className="font-semibold text-[#1D4D3A] hover:underline">
              Retour à mon espace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
