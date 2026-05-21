/** Fenêtre d’accès à la salle visio (minutes avant / après le créneau). */
export const VIDEO_JOIN_MINUTES_BEFORE = 15;
export const VIDEO_JOIN_HOURS_AFTER = 2;

export function appointmentVideoRoomName(appointmentId: string): string {
  return `medsim-${appointmentId.replace(/-/g, "").slice(0, 32)}`;
}

export function buildJitsiMeetingUrl(appointmentId: string): string {
  const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN?.trim() || "meet.jit.si";
  const room = appointmentVideoRoomName(appointmentId);
  return `https://${domain}/${room}`;
}

export function patientConsultationPath(appointmentId: string): string {
  return `/dashboard/patient/consultation/${appointmentId}`;
}

export type VideoJoinWindow = {
  canJoin: boolean;
  reason?: string;
  opensAt?: Date;
  closesAt?: Date;
};

export function getVideoJoinWindow(scheduledAt: Date | string): VideoJoinWindow {
  const start = new Date(scheduledAt);
  const opensAt = new Date(start.getTime() - VIDEO_JOIN_MINUTES_BEFORE * 60 * 1000);
  const closesAt = new Date(start.getTime() + VIDEO_JOIN_HOURS_AFTER * 60 * 60 * 1000);
  const now = Date.now();

  if (now < opensAt.getTime()) {
    return {
      canJoin: false,
      reason: "La salle ouvre 15 minutes avant le rendez-vous.",
      opensAt,
      closesAt,
    };
  }
  if (now > closesAt.getTime()) {
    return {
      canJoin: false,
      reason: "Ce créneau de consultation est terminé.",
      opensAt,
      closesAt,
    };
  }
  return { canJoin: true, opensAt, closesAt };
}

export function formatAppointmentFr(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-CA", {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const APPOINTMENT_STATUS_FR: Record<string, string> = {
  SCHEDULED: "Planifié",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};
