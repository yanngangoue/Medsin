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
      createdAt: true,
      profile: true,
      questionnaire: true,
    },
  });

  if (!patient) return badRequest("Patient introuvable");

  const { passwordHash: _ph, ...safe } = patient as typeof patient & { passwordHash?: string };
  void _ph;

  return NextResponse.json({ patient: safe });
}
