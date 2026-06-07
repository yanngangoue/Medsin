import { NextResponse } from "next/server";
import { requireIpsSession } from "@/lib/ips/auth";
import { ipsQuestionnaireListFilter } from "@/lib/ips/questionnaire-access";
import { computeUrgentFromCheckIns, type QueueQuestionnaire } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireIpsSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const practitionerName =
    session.user.name?.trim() || session.user.prenom?.trim() || "IPS";

  if (isDemoMode()) {
    return NextResponse.json({
      practitionerName,
      stats: { queuePending: 0, anneReportsUnread: 0, unreadChat: 0 },
      questionnaires: [] as QueueQuestionnaire[],
    });
  }

  const accessFilter = ipsQuestionnaireListFilter(
    session.user.id,
    session.user.role as "IPS" | "MEDECIN" | "ADMIN",
  );

  const [questionnaires, unreadAgg, anneReportsCount] = await Promise.all([
    prisma.medicalQuestionnaire.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW", "PRESCRIPTION_ISSUED", "APPROVED", "REJECTED"],
        },
        ...accessFilter,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, prenom: true, name: true, email: true } },
      },
      take: 80,
    }),
    prisma.chatMessage.count({
      where: {
        isRead: false,
        thread: { professionalId: session.user.id },
        senderId: { not: session.user.id },
      },
    }),
    prisma.weightCheckIn.count({
      where: {
        aiReport: { not: null },
        user: {
          medicalQuestionnaires: {
            some: { ipsId: session.user.id },
          },
        },
      },
    }),
  ]);

  const userIds = questionnaires.map((q) => q.userId);
  const [eligibilities, checkInsByUser] = await Promise.all([
    prisma.eligibilityCheck.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.weightCheckIn.findMany({
      where: { userId: { in: userIds } },
      orderBy: { recordedAt: "desc" },
      take: userIds.length * 8,
      select: { userId: true, weight: true, nausee: true, recordedAt: true },
    }),
  ]);

  const ageByUser = new Map<string, number>();
  for (const e of eligibilities) {
    if (e.userId && !ageByUser.has(e.userId)) ageByUser.set(e.userId, e.age);
  }

  const checkInsMap = new Map<string, typeof checkInsByUser>();
  for (const c of checkInsByUser) {
    const list = checkInsMap.get(c.userId) ?? [];
    if (list.length < 8) list.push(c);
    checkInsMap.set(c.userId, list);
  }

  const enriched: QueueQuestionnaire[] = questionnaires.map((q) => {
    const history = q.medicalHistory as Record<string, unknown>;
    const userCheckIns = checkInsMap.get(q.userId) ?? [];
    const { isUrgent, reasons } = computeUrgentFromCheckIns(userCheckIns);

    return {
      id: q.id,
      status: q.status,
      bmi: q.bmi,
      weight: q.weight,
      height: q.height,
      createdAt: q.createdAt.toISOString(),
      patientPrenom: q.user.prenom,
      patientNom: q.user.name,
      patientEmail: q.user.email,
      age: ageByUser.get(q.userId) ?? null,
      medicationRequested:
        typeof history.medicationPreference === "string"
          ? history.medicationPreference
          : null,
      isUrgent,
      urgentReasons: reasons,
    };
  });

  const queuePending = enriched.filter(
    (q) => q.status === "SUBMITTED" || q.status === "UNDER_REVIEW",
  ).length;

  return NextResponse.json({
    practitionerName,
    stats: {
      queuePending,
      anneReportsUnread: anneReportsCount,
      unreadChat: unreadAgg,
    },
    questionnaires: enriched,
  });
}
