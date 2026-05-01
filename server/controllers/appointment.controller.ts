import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { appointmentSchema } from "../../lib/validations";

export async function listAppointments(req: Request, res: Response) {
  const sub = req.auth?.sub;
  if (!sub) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  const items = await prisma.appointment.findMany({
    where: { userId: sub },
    orderBy: { scheduledAt: "asc" },
  });
  res.json({ appointments: items });
}

export async function createAppointment(req: Request, res: Response) {
  const sub = req.auth?.sub;
  if (!sub) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const when = new Date(parsed.data.scheduledAt);
  if (when.getTime() < Date.now()) {
    res.status(400).json({ error: "La date doit être dans le futur" });
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: sub,
      scheduledAt: when,
      notes: parsed.data.notes ?? null,
    },
  });

  res.status(201).json({ appointment });
}
