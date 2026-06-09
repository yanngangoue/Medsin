"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FulfillmentStatus =
  | "ISSUED"
  | "SENT_TO_PHARMACY"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const STEPS: { status: FulfillmentStatus; label: string }[] = [
  { status: "ISSUED", label: "Émise" },
  { status: "SENT_TO_PHARMACY", label: "Pharmacie" },
  { status: "IN_PREPARATION", label: "Préparation" },
  { status: "SHIPPED", label: "Expédiée" },
  { status: "DELIVERED", label: "Livrée" },
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

export function OrderTrackingCompact({ fulfillmentId }: Props) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/pharmacy/tracking/${fulfillmentId}`);
        if (cancelled) return;
        if (res.ok) {
          setData((await res.json()) as TrackingData);
        } else {
          console.error("[OrderTrackingCompact] load", res.status);
        }
      } catch (err) {
        if (!cancelled) console.error("[OrderTrackingCompact] load", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
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
    return (
      <div className="space-y-4">
        <div className="flex justify-between gap-2">
          {STEPS.map((s) => (
            <div key={s.status} className="h-2 flex-1 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Aucun suivi de livraison pour le moment.</p>;
  }

  const currentIdx = STEPS.findIndex((s) => s.status === data.status);

  return (
    <div className="space-y-4">
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <li key={step.status} className="flex flex-1 flex-col items-center text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? active
                      ? "bg-[#3EBD93] text-white ring-4 ring-[#3EBD93]/20"
                      : "bg-[#1D4D3A] text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`mt-1.5 hidden text-[10px] font-medium leading-tight sm:block ${
                  done ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 ? (
                <span
                  className={`absolute hidden h-0.5 sm:block ${done ? "bg-[#3EBD93]" : "bg-slate-200"}`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        {data.trackingUrl && data.trackingNumber ? (
          <a
            href={data.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#1D4D3A] hover:underline"
          >
            Suivi colis — {data.trackingNumber}
          </a>
        ) : data.trackingNumber ? (
          <span className="text-sm text-slate-600">N° {data.trackingNumber}</span>
        ) : null}

        {data.pdfUrl ? (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-full border-2 border-[#1D4D3A] px-4 text-sm font-semibold text-[#1D4D3A] hover:bg-[#1D4D3A]/5"
          >
            Télécharger ordonnance PDF
          </a>
        ) : (
          <Link
            href="/dashboard/patient/ordonnance"
            className="text-sm font-semibold text-slate-500 hover:text-[#1D4D3A]"
          >
            Voir le détail →
          </Link>
        )}
      </div>
    </div>
  );
}
