import { NextResponse } from "next/server";
import { requireIpsSession } from "@/lib/ips/auth";
import { ipsQuestionnaireListFilter } from "@/lib/ips/questionnaire-access";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireIpsSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ questionnaires: [] });
  }

  const accessFilter = ipsQuestionnaireListFilter(
    session.user.id,
    session.user.role as "IPS" | "MEDECIN" | "ADMIN",
  );

  const questionnaires = await prisma.medicalQuestionnaire.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "PRESCRIPTION_ISSUED"] },
      ...accessFilter,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { prenom: true, email: true } },
    },
    take: 50,
  });

  return NextResponse.json({
    questionnaires: questionnaires.map((q: (typeof questionnaires)[number]) => ({
      id: q.id,
      status: q.status,
      bmi: q.bmi,
      weight: q.weight,
      createdAt: q.createdAt.toISOString(),
      patientName: q.user.prenom,
      patientEmail: q.user.email,
    })),
  });
}
