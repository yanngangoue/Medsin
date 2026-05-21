import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { appointmentSchema } from "@/lib/validations";
import { toAppointmentDto } from "@/lib/telehealth/appointments-service";
import { notifyAppointmentConfirmed } from "@/lib/email/notify";

export async function listAppointments() {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const items = await prisma.appointment.findMany({
    where: { userId: session.sub },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ appointments: items.map(toAppointmentDto) });
}

export async function createAppointment(body: unknown) {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await getSessionUser();
  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients" }, { status: 403 });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const when = new Date(parsed.data.scheduledAt);
  if (when.getTime() < Date.now()) {
    return NextResponse.json({ error: "La date doit être dans le futur" }, { status: 400 });
  }

  const appt = await prisma.appointment.create({
    data: {
      userId: session.sub,
      scheduledAt: when,
      notes: parsed.data.notes ?? null,
    },
  });

  const patient = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true, prenom: true, name: true },
  });
  if (patient) {
    void notifyAppointmentConfirmed({
      userId: session.sub,
      email: patient.email,
      prenom: patient.prenom || patient.name || "Patient",
      appointmentId: appt.id,
      scheduledAt: appt.scheduledAt,
    });
  }

  return NextResponse.json({ appointment: toAppointmentDto(appt) });
}
