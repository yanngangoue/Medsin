"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AppointmentWithPatientDto } from "@/lib/telehealth/appointments-service";
import { APPOINTMENT_STATUS_FR } from "@/lib/telehealth/video-consultation";

type Props = {
  patientId?: string;
  compact?: boolean;
};

export function AdminTeleconsultSchedule({ patientId, compact }: Props) {
  const [items, setItems] = useState<AppointmentWithPatientDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ upcoming: "1" });
    if (patientId) params.set("patientId", patientId);
    const res = await fetch(`/api/admin/appointments?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as { appointments: AppointmentWithPatientDto[] };
      setItems(data.appointments ?? []);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-slate-500">Chargement des rendez-vous…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        Aucune téléconsultation planifiée
        {patientId ? " pour ce patient" : " à venir"}.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {items.map((a) => (
        <li
          key={a.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {!patientId ? (
                <p className="font-semibold text-slate-900">{a.patient.prenom}</p>
              ) : null}
              <p className={`text-sm ${patientId ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                {a.formattedDate}
              </p>
              {!patientId ? (
                <p className="text-xs text-slate-500">{a.patient.email}</p>
              ) : null}
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
              {APPOINTMENT_STATUS_FR[a.status] ?? a.status}
            </span>
          </div>
          {a.notes ? <p className="mt-2 text-xs text-slate-600">{a.notes}</p> : null}
          {a.joinWindow.canJoin ? (
            <Link
              href={`/admin/consultation/${a.id}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--teal-900)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal)]"
            >
              Rejoindre la visio (médecin)
            </Link>
          ) : (
            <p className="mt-2 text-xs text-amber-800">{a.joinWindow.reason}</p>
          )}
          {!patientId ? (
            <Link
              href={`/admin/patients/${a.patient.id}`}
              className="mt-2 inline-block text-xs font-medium text-[#16a34a] hover:underline"
            >
              Ouvrir le dossier patient →
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
