import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { getSessionUser } from "@/lib/session";
import { appointmentSchema } from "@/lib/validations";

export async function listAppointments() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "PATIENT") return forbidden();

  const items = await prisma.appointment.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ appointments: items });
}

export async function createAppointment(body: unknown) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "PATIENT") return forbidden();

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
      userId: user.id,
      scheduledAt: when,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ appointment: appt }, { status: 201 });
}
