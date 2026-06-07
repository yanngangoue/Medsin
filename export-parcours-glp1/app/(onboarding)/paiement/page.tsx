"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaiementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fulfillmentId = searchParams.get("fulfillment");
  const cancelled = searchParams.get("cancelled") === "1";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceLabel, setPriceLabel] = useState("149 $/mois");
  const [medication, setMedication] = useState<string | null>(null);

  useEffect(() => {
    if (!fulfillmentId) {
      setError("Aucune ordonnance à payer. Vérifiez le lien reçu par courriel.");
      return;
    }
    void (async () => {
      const res = await fetch(`/api/patient/fulfillment/${fulfillmentId}`);
      if (res.ok) {
        const data = (await res.json()) as {
          priceLabel: string;
          medication: string;
          paymentStatus: string;
        };
        setPriceLabel(data.priceLabel);
        setMedication(data.medication);
        if (data.paymentStatus === "PAID") {
          setError("Cette ordonnance a déjà été payée.");
        }
      }
    })();
  }, [fulfillmentId]);

  async function payer() {
    if (!fulfillmentId) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentId }),
    });

    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    setLoading(false);

    if (!res.ok || !data.url) {
      setError(data.error ?? "Impossible de démarrer le paiement");
      return;
    }

    router.push(data.url);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#3EBD93]">Étape 3</p>
      <h1 className="mt-2 text-3xl font-bold text-[#1A1A2E]">Paiement sécurisé</h1>

      {cancelled ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Paiement annulé — vous pouvez réessayer quand vous êtes prêt·e.
        </p>
      ) : null}

      <div className="mt-8 space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-[#6B7280]">Consultation initiale</span>
          <span className="font-semibold text-[#1A1A2E]">0 $</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6B7280]">
            {medication ? `${medication} + Anne` : "Programme mensuel (médicament + Anne)"}
          </span>
          <span className="font-semibold text-[#1A1A2E]">{priceLabel}</span>
        </div>
        <p className="text-xs text-[#6B7280]">Aucun frais caché · Annulable en tout temps</p>
      </div>

      <button
        type="button"
        disabled={loading || !fulfillmentId}
        onClick={() => void payer()}
        className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-[#3EBD93] text-base font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Redirection vers Stripe…" : "Procéder au paiement →"}
      </button>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        <Link href="/dashboard/patient" className="text-[#1D4D3A] hover:underline">
          Retour à mon espace
        </Link>
      </p>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense fallback={<p className="p-16 text-center text-sm text-[#6B7280]">Chargement…</p>}>
      <PaiementContent />
    </Suspense>
  );
}
