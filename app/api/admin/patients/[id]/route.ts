import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized, badRequest } from "@/lib/api-errors";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!isStaffRole(user.role)) return forbidden();

  const { id } = await params;
  const patient = await prisma.user.findFirst({
    where: { id, role: "PATIENT" },
    select: {
      id: true,
      prenom: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      profile: true,
      questionnaire: true,
    },
  });

  if (!patient) return badRequest("Patient introuvable");

  const [messages, eligibilityHistory] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: id, receiver: { role: { in: ["MEDECIN", "ADMIN"] } } },
          { receiverId: id, sender: { role: { in: ["MEDECIN", "ADMIN"] } } },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        read: true,
        createdAt: true,
        sender: { select: { id: true, role: true, prenom: true, name: true } },
      },
    }),
    prisma.eligibilityHistory.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        note: true,
        createdAt: true,
        changedBy: { select: { id: true, prenom: true, name: true, role: true } },
      },
    }),
  ]);

  return NextResponse.json({ patient, messages, eligibilityHistory });
}
