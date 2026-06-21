"use client";

import { useState } from "react";

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

const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Reçue",
  SENT_TO_PHARMACY: "Reçue",
  IN_PREPARATION: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export function PharmacieFulfillmentActions({
  fulfillment,
  onUpdated,
}: {
  fulfillment: FulfillmentRow;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: "confirm_receipt" | "mark_shipped" | "confirm_delivery") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pharmacie/fulfillments/${fulfillment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        ...(action === "mark_shipped" ? { trackingNumber: tracking } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Action impossible");
      return;
    }
    onUpdated();
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {["ISSUED", "SENT_TO_PHARMACY"].includes(fulfillment.status) ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void runAction("confirm_receipt")}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          Confirmer réception
        </button>
      ) : null}
      {fulfillment.status === "IN_PREPARATION" ? (
        <>
          <input
            type="text"
            placeholder="N° de suivi"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            disabled={loading || !tracking.trim()}
            onClick={() => void runAction("mark_shipped")}
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Marquer expédié
          </button>
        </>
      ) : null}
      {fulfillment.status === "SHIPPED" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void runAction("confirm_delivery")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Confirmer livraison
        </button>
      ) : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function PharmacieFulfillmentTable({
  rows,
  onRefresh,
}: {
  rows: FulfillmentRow[];
  onRefresh: () => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-10 text-center text-sm text-slate-500">
        Aucune ordonnance en attente.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Médicament</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Adresse</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Statut</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">PDF</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((f) => (
            <tr key={f.id} className="align-top hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {f.patientPrenom} {f.patientNom ?? ""}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {f.medication}
                <br />
                <span className="text-xs text-slate-400">{f.dosage}</span>
              </td>
              <td className="max-w-[180px] px-4 py-3 text-xs text-slate-500">{f.deliveryAddress}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                  {STATUS_LABEL[f.status] ?? f.status}
                </span>
                {f.trackingNumber ? (
                  <p className="mt-1 text-[10px] text-slate-400">Suivi : {f.trackingNumber}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {f.pdfUrl ? (
                  <a
                    href={f.pdfUrl}
                    download="ordonnance-anne-sante.pdf"
                    className="text-xs font-semibold text-[#1D4D3A] hover:underline"
                  >
                    Télécharger
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <PharmacieFulfillmentActions fulfillment={f} onUpdated={onRefresh} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
