import type { Appointment, AppointmentStatus, User } from "@prisma/client";
import {
  formatAppointmentFr,
  getVideoJoinWindow,
  patientConsultationPath,
  type VideoJoinWindow,
} from "@/lib/telehealth/video-consultation";

export type AppointmentDto = {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string | null;
  videoJoinPath: string;
  joinWindow: VideoJoinWindow;
  formattedDate: string;
};

export type AppointmentWithPatientDto = AppointmentDto & {
  patient: {
    id: string;
    prenom: string;
    email: string;
  };
};

export function toAppointmentDto(row: Appointment): AppointmentDto {
  const scheduledAt = row.scheduledAt.toISOString();
  return {
    id: row.id,
    scheduledAt,
    status: row.status,
    notes: row.notes,
    videoJoinPath: patientConsultationPath(row.id),
    joinWindow: getVideoJoinWindow(row.scheduledAt),
    formattedDate: formatAppointmentFr(scheduledAt),
  };
}

export function toAppointmentWithPatient(
  row: Appointment & { user: Pick<User, "id" | "prenom" | "name" | "email"> },
): AppointmentWithPatientDto {
  return {
    ...toAppointmentDto(row),
    patient: {
      id: row.user.id,
      prenom: row.user.prenom || row.user.name || "Patient",
      email: row.user.email,
    },
  };
}
