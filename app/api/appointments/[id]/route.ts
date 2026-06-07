import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { toAppointmentDto } from "@/lib/telehealth/appointments-service";
import {
  buildJitsiMeetingUrl,
  getVideoJoinWindow,
} from "@/lib/telehealth/video-consultation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const isStaff = isStaffRole(user.role);
  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: isStaff ? { id } : { id, userId: user.id },
    include: {
      user: { select: { id: true, prenom: true, name: true, email: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }

  if (!isStaff && appointment.userId !== user.id) {
    return forbidden();
  }

  const dto = toAppointmentDto(appointment);
  const joinWindow = getVideoJoinWindow(appointment.scheduledAt);

  return NextResponse.json({
    appointment: {
      ...dto,
      patient: isStaff
        ? {
            id: appointment.user.id,
            prenom: appointment.user.prenom || appointment.user.name || "Patient",
            email: appointment.user.email,
          }
        : undefined,
    },
    video: {
      roomPath: isStaff ? `/admin/consultation/${appointment.id}` : dto.videoJoinPath,
      externalUrl: buildJitsiMeetingUrl(appointment.id),
      joinWindow,
    },
    role: isStaff ? "staff" : "patient",
  });
}
