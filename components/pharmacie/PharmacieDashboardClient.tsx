"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PharmacieFulfillmentTable } from "@/components/pharmacie/PharmacieFulfillmentPanel";
import { MedsimLogo } from "@/components/MedsimLogo";
import { SignOutButton } from "@/components/role-portal/SignOutButton";

type FulfillmentRow = {
  id: string;
  status: string;
  medication: string;
  dosage: string;
  trackingNumber: string | null;
  pdfUrl: string | null;
  createdAt: string;
  patientPrenom: string;
  patientNom: string | null;
  deliveryAddress: string;
};

type DashboardPayload = {
  prenom: string;
  pharmacyName: string | null;
  fulfillments: FulfillmentRow[];
};

export function PharmacieDashboardClient() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pharmacie/dashboard");
    if (res.ok) {
      setData((await res.json()) as DashboardPayload);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = (data?.fulfillments ?? []).filter((f) => f.status !== "DELIVERED" && f.status !== "CANCELLED");
  const delivered = (data?.fulfillments ?? []).filter((f) => f.status === "DELIVERED");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200/80 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" aria-label="Anne-sante">
            <MedsimLogo />
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Espace pharmacie{data?.pharmacyName ? ` · ${data.pharmacyName}` : ""}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Bonjour, {data?.prenom ?? "…"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Ordonnances et livraisons · temps réel</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Actives", value: active.length },
            { label: "Livrées", value: delivered.length },
            { label: "Total", value: data?.fulfillments.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? "…" : value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Ordonnances actives</h2>
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ) : (
            <PharmacieFulfillmentTable rows={active} onRefresh={() => void load()} />
          )}
        </section>

        {delivered.length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Historique livré</h2>
            <PharmacieFulfillmentTable rows={delivered.slice(0, 20)} onRefresh={() => void load()} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
