import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentReminder } from "@/lib/email/notify";

function authorizeCron(req: Request): boolean {
  const secret = process.env.MEDSIM_CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Rappels RDV 24 h et ~15 min — appeler via cron (ex. toutes les 5 min). */
export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = Date.now();
  const in24hStart = new Date(now + 23 * 60 * 60 * 1000);
  const in24hEnd = new Date(now + 25 * 60 * 60 * 1000);
  const in15Start = new Date(now + 10 * 60 * 1000);
  const in15End = new Date(now + 20 * 60 * 1000);

  const [for24h, for15] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gte: in24hStart, lte: in24hEnd },
      },
      include: {
        user: { select: { id: true, email: true, prenom: true, name: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gte: in15Start, lte: in15End },
      },
      include: {
        user: { select: { id: true, email: true, prenom: true, name: true } },
      },
    }),
  ]);

  let sent = 0;

  for (const appt of for24h) {
    const r = await notifyAppointmentReminder({
      userId: appt.user.id,
      email: appt.user.email,
      prenom: appt.user.prenom || appt.user.name || "Patient",
      appointmentId: appt.id,
      scheduledAt: appt.scheduledAt,
      window: "24h",
    });
    if (r.ok && !r.skipped) sent += 1;
  }

  for (const appt of for15) {
    const r = await notifyAppointmentReminder({
      userId: appt.user.id,
      email: appt.user.email,
      prenom: appt.user.prenom || appt.user.name || "Patient",
      appointmentId: appt.id,
      scheduledAt: appt.scheduledAt,
      window: "15min",
    });
    if (r.ok && !r.skipped) sent += 1;
  }

  return NextResponse.json({
    ok: true,
    checked24h: for24h.length,
    checked15min: for15.length,
    sent,
  });
}
