"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { MedsimLogo } from "@/components/MedsimLogo";
import { OrderTrackingLive } from "@/components/patient/OrderTrackingLive";
import { PatientFelixSidebar } from "@/components/dashboard/patient-space/PatientFelixSidebar";
import type { AiCoachMessagePublic } from "@/lib/patient/ai-coach";

type PharmacyInfo = {
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
};

type PrescriptionData = {
  id: string;
  status: string;
  paymentStatus: string;
  medication: string;
  dosage: string;
  refills: number;
  prescriptionNumber: string;
  ipsName: string;
  issuedAt: string;
  trackingNumber: string | null;
  pdfUrl: string | null;
  estimatedDelivery: string | null;
  pharmacy: PharmacyInfo | null;
};

const ANNE_READ_KEY = "medsim-anne-read-ids";

function readAnneIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ANNE_READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

type Props = {
  prenom: string;
  fulfillmentId: string | null;
};

function PatientOrdonnanceViewInner({ prenom, fulfillmentId }: Props) {
  const [loading, setLoading] = useState(Boolean(fulfillmentId));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [coachMessages, setCoachMessages] = useState<AiCoachMessagePublic[]>([]);

  const load = useCallback(async () => {
    if (!fulfillmentId) {
      setLoading(false);
      return;
    }

    const [trackingRes, coachRes] = await Promise.all([
      fetch(`/api/pharmacy/tracking/${fulfillmentId}`),
      fetch("/api/patient/weight-program/coach"),
    ]);

    if (trackingRes.ok) {
      setPrescription((await trackingRes.json()) as PrescriptionData);
    }
    if (coachRes.ok) {
      const body = (await coachRes.json()) as { messages?: AiCoachMessagePublic[] };
      setCoachMessages(body.messages ?? []);
    }
    setLoading(false);
  }, [fulfillmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const anneHasNewMessage = useMemo(() => {
    const ids = readAnneIds();
    const last = [...coachMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
    return last?.role === "assistant" && !ids.has(last.id);
  }, [coachMessages]);

  const issuedDate = prescription
    ? new Date(prescription.issuedAt).toLocaleDateString("fr-CA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const hasPdf = Boolean(prescription?.pdfUrl) || Boolean(fulfillmentId);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <PatientFelixSidebar prenom={prenom} anneHasNewMessage={anneHasNewMessage} />
        </Suspense>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white transition-transform lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Suspense fallback={<div className="h-full animate-pulse bg-slate-50" />}>
          <PatientFelixSidebar
            prenom={prenom}
            anneHasNewMessage={anneHasNewMessage}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </Suspense>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
          <Link href="/" aria-label="Anne Santé">
            <MedsimLogo />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Mon ordonnance &amp; livraison
            </h1>
            {!loading && prescription && hasPdf ? (
              <a
                href={`/api/patient/prescription/${prescription.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1D4D3A] px-4 py-2.5 text-sm font-semibold text-[#1D4D3A] hover:bg-[#1D4D3A]/5"
              >
                ⬇ Télécharger PDF
              </a>
            ) : loading ? (
              <Skeleton className="h-10 w-40" />
            ) : null}
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !fulfillmentId || !prescription ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm leading-relaxed text-slate-500">
              Votre ordonnance apparaîtra ici après l&apos;évaluation de votre dossier par votre
              IPS.
            </p>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Médicament
                    </dt>
                    <dd className="mt-1 text-base font-bold text-slate-900">
                      {prescription.medication}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dose
                    </dt>
                    <dd className="mt-1 text-base font-medium text-slate-800">
                      {prescription.dosage}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Prescrit par
                    </dt>
                    <dd className="mt-1 text-base text-slate-800">{prescription.ipsName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </dt>
                    <dd className="mt-1 text-base text-slate-800">{issuedDate}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Renouvellements
                    </dt>
                    <dd className="mt-1 text-base text-slate-800">
                      {prescription.refills} restants
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Numéro ordonnance
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-slate-800">
                      {prescription.prescriptionNumber}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Suivi de livraison</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mise à jour automatique toutes les 30 secondes.
                </p>
                <div className="mt-5">
                  <OrderTrackingLive fulfillmentId={fulfillmentId} />
                </div>
              </section>

              {prescription.pharmacy ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Pharmacie partenaire</h2>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{prescription.pharmacy.name}</p>
                    <p>
                      {prescription.pharmacy.address}
                      <br />
                      {prescription.pharmacy.city}, {prescription.pharmacy.province}
                    </p>
                    <p>
                      <a
                        href={`tel:${prescription.pharmacy.phone.replace(/\s/g, "")}`}
                        className="font-semibold text-[#1D4D3A] hover:underline"
                      >
                        {prescription.pharmacy.phone}
                      </a>
                    </p>
                    <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-slate-600">
                      <li>Livraison discrète — emballage sans mention médicale</li>
                      <li>Signature requise à la livraison</li>
                    </ul>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export function PatientOrdonnanceView(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#FAFAF8]" />}>
      <PatientOrdonnanceViewInner {...props} />
    </Suspense>
  );
}
