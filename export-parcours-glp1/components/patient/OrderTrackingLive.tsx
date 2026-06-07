"use client";

import { useEffect, useState } from "react";
type FulfillmentStatus =
  | "ISSUED"
  | "SENT_TO_PHARMACY"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const STEPS: { status: FulfillmentStatus; label: string; icon: string }[] = [
  { status: "ISSUED", label: "Ordonnance émise", icon: "✅" },
  { status: "SENT_TO_PHARMACY", label: "Envoyée à la pharmacie", icon: "✅" },
  { status: "IN_PREPARATION", label: "En préparation", icon: "🔄" },
  { status: "SHIPPED", label: "Expédiée", icon: "📦" },
  { status: "DELIVERED", label: "Livrée", icon: "🏠" },
];

type TrackingData = {
  status: FulfillmentStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  pdfUrl: string | null;
};

type Props = {
  fulfillmentId: string;
};

export function OrderTrackingLive({ fulfillmentId }: Props) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/pharmacy/tracking/${fulfillmentId}`);
      if (!cancelled && res.ok) {
        setData((await res.json()) as TrackingData);
      }
      if (!cancelled) setLoading(false);
    }

    void load();
    const interval = setInterval(() => {
      if (data?.status !== "DELIVERED" && data?.status !== "CANCELLED") {
        void load();
      }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fulfillmentId, data?.status]);

  if (loading) {
    return <p className="text-sm text-[#6B7280]">Chargement du suivi…</p>;
  }

  if (!data) {
    return <p className="text-sm text-[#6B7280]">Aucun suivi de livraison pour le moment.</p>;
  }

  const currentIdx = STEPS.findIndex((s) => s.status === data.status);

  return (
    <div className="space-y-6">
      {data.pdfUrl ? (
        <a
          href={data.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-xl border-2 border-[#1D4D3A] px-4 py-2 text-sm font-semibold text-[#1D4D3A]"
        >
          Télécharger mon ordonnance (PDF)
        </a>
      ) : null}

      <ol className="space-y-4 border-l-2 border-[#E5E7EB] pl-6">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          return (
            <li key={step.status} className="relative">
              <span
                className={`absolute -left-[1.6rem] flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  done ? "bg-[#3EBD93] text-white" : "bg-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                {done ? step.icon : "·"}
              </span>
              <p className={`text-sm font-medium ${done ? "text-[#1A1A2E]" : "text-[#6B7280]"}`}>
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      {data.trackingUrl && data.trackingNumber ? (
        <a
          href={data.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#1D4D3A] hover:underline"
        >
          Suivre le colis — {data.trackingNumber}
        </a>
      ) : null}
    </div>
  );
}
