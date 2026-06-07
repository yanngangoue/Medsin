"use client";

import { useCallback, useEffect, useState } from "react";

type FulfillmentStatus =
  | "ISSUED"
  | "SENT_TO_PHARMACY"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type StepDates = {
  issued: string | null;
  paid: string | null;
  preparation: string | null;
  shipped: string | null;
  delivered: string | null;
};

type TrackingData = {
  id: string;
  status: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  pdfUrl: string | null;
  estimatedDelivery: string | null;
  stepDates: StepDates;
};

type Props = {
  fulfillmentId: string;
  showPdfButton?: boolean;
};

const STEPS: {
  key: keyof StepDates;
  label: string;
  description?: string;
  index: number;
}[] = [
  { key: "issued", label: "Ordonnance émise", index: 0 },
  { key: "paid", label: "Paiement confirmé", index: 1 },
  {
    key: "preparation",
    label: "En préparation à la pharmacie",
    description:
      "Votre médicament est préparé par notre pharmacie partenaire",
    index: 2,
  },
  { key: "shipped", label: "Expédiée", index: 3 },
  { key: "delivered", label: "Livrée", index: 4 },
];

function isStepDone(index: number, status: FulfillmentStatus, paymentStatus: PaymentStatus): boolean {
  if (index === 0) return true;
  if (index === 1) return paymentStatus === "PAID";
  if (index === 2) {
    return ["SENT_TO_PHARMACY", "IN_PREPARATION", "SHIPPED", "DELIVERED"].includes(status);
  }
  if (index === 3) return status === "SHIPPED" || status === "DELIVERED";
  if (index === 4) return status === "DELIVERED";
  return false;
}

function activeStepIndex(status: FulfillmentStatus, paymentStatus: PaymentStatus): number {
  if (status === "DELIVERED") return -1;
  if (status === "SHIPPED") return 3;
  if (status === "IN_PREPARATION" || status === "SENT_TO_PHARMACY") return 2;
  if (paymentStatus === "PAID") return 2;
  if (paymentStatus === "PENDING") return 1;
  return 0;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderTrackingLive({ fulfillmentId, showPdfButton = false }: Props) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/pharmacy/tracking/${fulfillmentId}`);
    if (res.ok) {
      setData((await res.json()) as TrackingData);
    }
    setLoading(false);
  }, [fulfillmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data || data.status === "DELIVERED" || data.status === "CANCELLED") return;

    const interval = setInterval(() => {
      void load();
    }, 30_000);

    return () => clearInterval(interval);
  }, [data, load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-100" />
        <div className="space-y-3 pl-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-[#6B7280]">Aucun suivi de livraison pour le moment.</p>;
  }

  const activeIdx = activeStepIndex(data.status, data.paymentStatus);
  const hasPdf = Boolean(data.pdfUrl) || fulfillmentId !== "demo";

  return (
    <div className="space-y-6">
      {showPdfButton && hasPdf ? (
        <a
          href={`/api/patient/prescription/${fulfillmentId}/pdf`}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1D4D3A] px-4 py-2.5 text-sm font-semibold text-[#1D4D3A] hover:bg-[#1D4D3A]/5"
        >
          ⬇ Télécharger PDF
        </a>
      ) : null}

      <ol className="space-y-6 border-l-2 border-[#E5E7EB] pl-6">
        {STEPS.map((step) => {
          const done = isStepDone(step.index, data.status, data.paymentStatus);
          const isActive = step.index === activeIdx;
          const pulse =
            isActive &&
            (data.status === "IN_PREPARATION" || data.status === "SENT_TO_PHARMACY");
          const date = formatDate(data.stepDates[step.key]);

          return (
            <li key={step.key} className="relative">
              <span
                className={`absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  done
                    ? "bg-[#3EBD93] text-white"
                    : isActive
                      ? "bg-white ring-2 ring-[#3EBD93] text-[#1D4D3A]"
                      : "bg-[#E5E7EB] text-[#6B7280]"
                } ${pulse ? "animate-pulse" : ""}`}
                aria-hidden
              >
                {done ? "✅" : isActive ? "🔄" : "⏳"}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    done || isActive ? "text-[#1A1A2E]" : "text-[#6B7280]"
                  }`}
                >
                  {step.label}
                </p>
                {done && date ? (
                  <p className="mt-0.5 text-xs text-[#3EBD93]">Complétée — {date}</p>
                ) : isActive ? (
                  <p className="mt-0.5 text-xs font-medium text-[#3EBD93]">En cours…</p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">En attente</p>
                )}
                {isActive && step.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                ) : null}
                {step.key === "shipped" && data.trackingNumber ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-700">
                      Numéro de suivi : <strong>{data.trackingNumber}</strong>
                    </p>
                    {data.trackingUrl ? (
                      <a
                        href={data.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-sm font-semibold text-[#1D4D3A] hover:underline"
                      >
                        Suivre sur Purolator →
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {data.estimatedDelivery ? (
        <p className="rounded-xl border border-slate-200 bg-[#FAFAF8] px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Livraison estimée : </span>
          {formatDate(data.estimatedDelivery)}
        </p>
      ) : null}
    </div>
  );
}
