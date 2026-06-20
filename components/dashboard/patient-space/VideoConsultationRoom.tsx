"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildJitsiMeetingUrl,
  formatAppointmentFr,
  getVideoJoinWindow,
} from "@/lib/telehealth/video-consultation";

type Props = {
  appointmentId: string;
  displayName: string;
  backHref: string;
  backLabel: string;
};

type ConsultationData = {
  appointment: {
    id: string;
    scheduledAt: string;
    status: string;
    notes: string | null;
    patient?: { prenom: string; email: string };
  };
  video: {
    externalUrl: string;
    joinWindow: ReturnType<typeof getVideoJoinWindow>;
  };
  role: "patient" | "staff";
};

export function VideoConsultationRoom({
  appointmentId,
  displayName,
  backHref,
  backLabel,
}: Props) {
  const [data, setData] = useState<ConsultationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/appointments/${appointmentId}`);
      if (!res.ok) {
        setError("Rendez-vous introuvable ou accès refusé.");
        return;
      }
      const json = (await res.json()) as ConsultationData;
      setData(json);
    })();
  }, [appointmentId]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">{error}</p>
        <Link
          href={backHref}
          className="mt-6 inline-flex text-sm font-semibold text-[#1D9E75] hover:underline"
        >
          {backLabel}
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Préparation de la salle…
      </div>
    );
  }

  const { appointment, video } = data;
  const join = video.joinWindow;
  const subtitle =
    data.role === "staff" && appointment.patient
      ? `Patient : ${appointment.patient.prenom} (${appointment.patient.email})`
      : formatAppointmentFr(appointment.scheduledAt);

  if (!join.canJoin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-xl font-bold text-slate-900">Consultation vidéo</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{join.reason}</p>
        <p className="mt-2 text-sm font-medium text-slate-800">
          Rendez-vous : {formatAppointmentFr(appointment.scheduledAt)}
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white"
        >
          {backLabel}
        </Link>
      </div>
    );
  }

  const meetingUrl = buildJitsiMeetingUrl(appointment.id);

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-medium text-white/70">
            Anne-sante · {data.role === "staff" ? "Médecin" : "Patient"}
          </p>
          <p className="text-sm font-semibold text-white">
            {displayName}
            {data.role === "staff" ? "" : ` · ${subtitle}`}
          </p>
          {data.role === "staff" ? (
            <p className="text-xs text-white/60">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={backHref}
          className="shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
        >
          Quitter
        </Link>
      </header>

      <div className="relative flex-1">
        <iframe
          title="Consultation vidéo Anne-sante"
          src={meetingUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <p className="px-4 py-2 text-center text-[10px] text-white/50">
        Salle privée — autorisez caméra et micro. Même lien pour le patient et le médecin.
      </p>
    </div>
  );
}
