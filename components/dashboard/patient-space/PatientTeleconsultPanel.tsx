"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  APPOINTMENT_STATUS_FR,
  formatAppointmentFr,
  getVideoJoinWindow,
  patientConsultationPath,
} from "@/lib/telehealth/video-consultation";

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
};

function VideoIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

export function PatientTeleconsultPanel() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const refresh = useCallback(async () => {
    setListLoading(true);
    const res = await fetch("/api/appointments");
    const json = (await res.json().catch(() => ({}))) as { appointments?: Appointment[] };
    if (res.ok && Array.isArray(json.appointments)) {
      setItems(json.appointments);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!datetimeLocal) {
      setError("Choisissez une date et une heure.");
      return;
    }
    const scheduledAt = new Date(datetimeLocal).toISOString();
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt, notes: notes.trim() || undefined }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Impossible de planifier le rendez-vous.");
        return;
      }
      setNotes("");
      setDatetimeLocal("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  const upcoming = items.filter((a) => a.status === "SCHEDULED");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-[#1D9E75]">
          <VideoIcon />
          <h2 className="text-lg font-bold text-slate-900">Consultation vidéo</h2>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Prenez rendez-vous avec un médecin Anne-sante, puis rejoignez la salle sécurisée à l&apos;heure
          prévue.
        </p>
      </div>

      <div className="flex-1 space-y-5 px-5 py-5 sm:px-6">
        <form
          onSubmit={(e) => void onBook(e)}
          className="rounded-xl border border-[#C8E6D9]/60 bg-[#F0FBF7]/50 p-4"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Nouveau rendez-vous
          </p>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">Date et heure</span>
            <input
              type="datetime-local"
              value={datetimeLocal}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDatetimeLocal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
              required
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">Motif (optionnel)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Ex. : suivi GLP-1, questions sur mon dossier…"
            />
          </label>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-[#1D9E75] py-3 text-sm font-bold text-white transition hover:bg-[#178f6a] disabled:opacity-50"
          >
            {loading ? "Planification…" : "Planifier la consultation"}
          </button>
        </form>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Vos rendez-vous
          </p>
          {listLoading ? (
            <p className="mt-3 text-sm text-slate-500">Chargement…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Aucune consultation planifiée. Réservez un créneau ci-dessus.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {upcoming.map((a) => {
                const join = getVideoJoinWindow(a.scheduledAt);
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatAppointmentFr(a.scheduledAt)}
                      </p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        {APPOINTMENT_STATUS_FR[a.status] ?? a.status}
                      </span>
                    </div>
                    {a.notes ? (
                      <p className="mt-2 text-xs text-slate-600">{a.notes}</p>
                    ) : null}
                    {join.canJoin ? (
                      <Link
                        href={patientConsultationPath(a.id)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--teal-900)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--teal)]"
                      >
                        <VideoIcon />
                        Rejoindre la visio
                      </Link>
                    ) : (
                      <p className="mt-3 text-xs leading-relaxed text-amber-800/90">
                        {join.reason}
                        {join.opensAt
                          ? ` Ouverture : ${formatAppointmentFr(join.opensAt.toISOString())}.`
                          : null}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="text-[10px] leading-relaxed text-slate-400">
          Visioconférence chiffrée via salle privée Anne-sante. Connexion possible 15 min avant le
          rendez-vous. Un avis médical formel suit la consultation.
        </p>
      </div>
    </div>
  );
}
