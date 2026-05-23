import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";

export async function listAppointments() {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const items = await prisma.appointment.findMany({
    where: { userId: session.sub },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ appointments: items });
}

export async function createAppointment(body: unknown) {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
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

  return NextResponse.json({ appointment: appt });
}
