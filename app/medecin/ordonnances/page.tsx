"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Ordonnance = {
  id: string;
  numeroOrdonnance: string;
  medicament: string;
  status: string;
  signatureDate: string | null;
  createdAt: string;
  patient: { prenom: string; name: string | null };
};

export default function MedecinOrdonnancesPage() {
  const [rows, setRows] = useState<Ordonnance[]>([]);

  useEffect(() => {
    void fetch("/api/medecin/ordonnances")
      .then((r) => r.json())
      .then((d: { ordonnances: Ordonnance[] }) => setRows(d.ordonnances ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Ordonnances émises</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Médicament</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Aucune ordonnance
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{o.numeroOrdonnance.slice(0, 8)}…</td>
                  <td className="px-4 py-3">{o.patient.prenom || o.patient.name}</td>
                  <td className="px-4 py-3">{o.medicament}</td>
                  <td className="px-4 py-3">{o.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Link href="/medecin/file" className="mt-4 inline-block text-sm text-[#16a34a]">
        ← File de travail
      </Link>
    </div>
  );
}
