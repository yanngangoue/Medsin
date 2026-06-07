"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminPharmacyOrder, AdminPharmacyStats } from "@/app/api/admin/pharmacies/route";

const STATUS_LABELS: Record<string, string> = {
  SENT_TO_PHARMACY: "Envoyée pharmacie",
  IN_PREPARATION: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
};

export function AdminPharmaciesPanel() {
  const [stats, setStats] = useState<AdminPharmacyStats | null>(null);
  const [orders, setOrders] = useState<AdminPharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/pharmacies");
    if (res.ok) {
      const data = (await res.json()) as {
        stats: AdminPharmacyStats;
        orders: AdminPharmacyOrder[];
      };
      setStats(data.stats);
      setOrders(data.orders);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(
    id: string,
    status: "SHIPPED" | "DELIVERED",
    trackingNumber?: string,
  ) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/pharmacy/tracking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(trackingNumber ? { trackingNumber } : {}),
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Échec de la mise à jour");
      }
      setMessage(`Statut mis à jour — ${STATUS_LABELS[status] ?? status}`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="En attente" value={stats.pending} hint="Préparation pharmacie" />
          <StatCard label="Expédiées" value={stats.shipped} hint="En transit" />
          <StatCard label="Livrées" value={stats.delivered} hint="Complétées" />
          <StatCard
            label="Délai moyen"
            value={stats.avgDeliveryDays != null ? `${stats.avgDeliveryDays} j` : "—"}
            hint="Paiement → livraison"
          />
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Ordonnances en cours</h2>
          <p className="text-sm text-slate-500">
            Marquez expédiée (numéro de suivi) ou livrée — le patient est notifié automatiquement.
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Aucune ordonnance en attente de traitement.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.map((o) => (
              <li key={o.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {o.patientName}{" "}
                      <span className="font-mono text-sm font-normal text-slate-500">
                        #{o.prescriptionNumber}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {o.medication} · {o.dosage}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{o.deliveryHint}</p>
                    {o.pharmacyName ? (
                      <p className="mt-1 text-xs text-[#16a34a]">{o.pharmacyName}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>

                {o.status !== "SHIPPED" && o.status !== "DELIVERED" ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1">
                      <label
                        htmlFor={`track-${o.id}`}
                        className="text-xs font-medium text-slate-600"
                      >
                        Numéro de suivi (expédition)
                      </label>
                      <input
                        id={`track-${o.id}`}
                        type="text"
                        value={trackingInputs[o.id] ?? o.trackingNumber ?? ""}
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({ ...prev, [o.id]: e.target.value }))
                        }
                        placeholder="Purolator ou Postes Canada"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() =>
                        void updateStatus(
                          o.id,
                          "SHIPPED",
                          trackingInputs[o.id]?.trim() || undefined,
                        )
                      }
                      className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                    >
                      Marquer expédiée
                    </button>
                  </div>
                ) : null}

                {o.status === "SHIPPED" ? (
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => void updateStatus(o.id, "DELIVERED")}
                    className="rounded-lg border border-[#16a34a] px-4 py-2 text-sm font-semibold text-[#16a34a] hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Marquer livrée
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
