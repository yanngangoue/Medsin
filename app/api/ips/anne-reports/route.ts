import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { patientDisplayName } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export type AnneReportPublic = {
  id: string;
  userId: string;
  patientName: string;
  kind: "CHECK_IN" | "WEEKLY";
  weekNumber: number | null;
  content: string;
  isEscalation: boolean;
  createdAt: string;
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "IPS" && session.user.role !== "MEDECIN") {
    return NextResponse.json({ error: "Accès réservé aux IPS" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (isDemoMode()) {
    return NextResponse.json({ reports: [] as AnneReportPublic[] });
  }

  const rows = await prisma.anneIpsReport.findMany({
    where: {
      ipsId: session.user.id,
      ...(patientId ? { userId: patientId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { prenom: true, name: true } },
    },
  });

  const reports: AnneReportPublic[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    patientName: patientDisplayName(r.user.prenom ?? "", r.user.name),
    kind: r.kind,
    weekNumber: r.weekNumber,
    content: r.content,
    isEscalation: r.isEscalation,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ reports });
}
