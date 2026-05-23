import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";

export async function GET() {
  const auth = await requireMedecinApi();
  if ("error" in auth) return auth.error;

  const where =
    auth.role === "ADMIN"
      ? {}
      : { medecinId: auth.user.id };

  const ordonnances = await prisma.prescription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      patient: { select: { id: true, prenom: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    ordonnances: ordonnances.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      signatureDate: o.signatureDate?.toISOString() ?? null,
    })),
  });
}
