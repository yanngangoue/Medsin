import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { computeUrgentFromCheckIns } from "@/lib/ips/queue-utils";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";
import type { ConsultationStatus } from "@prisma/client";

export type AdminIpsPractitioner = {
  id: string;
  name: string;
  email: string;
  license: string | null;
  pendingCount: number;
  assignedCount: number;
};

export type AdminIpsQueueItem = {
  id: string;
  status: ConsultationStatus;
  bmi: number;
  patientName: string;
  patientEmail: string;
  ipsName: string | null;
  ipsId: string | null;
  createdAt: string;
  isUrgent: boolean;
};

export type AdminIpsStats = {
  practitioners: number;
  pending: number;
  underReview: number;
  unassigned: number;
  approved: number;
};

export async function GET() {
  return catchRouteError("admin/ips/GET", async () => {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    if (isDemoMode()) {
      return NextResponse.json({
        stats: {
          practitioners: 1,
          pending: 2,
          underReview: 0,
          unassigned: 0,
          approved: 1,
        } satisfies AdminIpsStats,
        practitioners: [] as AdminIpsPractitioner[],
        queue: [] as AdminIpsQueueItem[],
      });
    }

    const [ipsUsers, questionnaires, checkIns] = await Promise.all([
      prisma.user.findMany({
        where: { role: "IPS" },
        select: {
          id: true,
          prenom: true,
          name: true,
          email: true,
          medecinLicenseNumber: true,
        },
        orderBy: { prenom: "asc" },
      }),
      prisma.medicalQuestionnaire.findMany({
        where: {
          status: {
            in: [
              "SUBMITTED",
              "UNDER_REVIEW",
              "PRESCRIPTION_ISSUED",
              "APPROVED",
              "REJECTED",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
        include: {
          user: { select: { prenom: true, name: true, email: true } },
        },
      }),
      prisma.weightCheckIn.findMany({
        orderBy: { recordedAt: "desc" },
        take: 200,
        select: { userId: true, weight: true, nausee: true, recordedAt: true },
      }),
    ]);

    const ipsById = new Map(
      ipsUsers.map((u) => [
        u.id,
        { name: u.prenom || u.name || "IPS", email: u.email, license: u.medecinLicenseNumber },
      ]),
    );

    const checkInsByUser = new Map<string, typeof checkIns>();
    for (const c of checkIns) {
      const list = checkInsByUser.get(c.userId) ?? [];
      if (list.length < 8) list.push(c);
      checkInsByUser.set(c.userId, list);
    }

    const pendingStatuses = new Set<ConsultationStatus>(["SUBMITTED", "UNDER_REVIEW"]);
    const approvedStatuses = new Set<ConsultationStatus>(["APPROVED", "PRESCRIPTION_ISSUED"]);

    const loadByIps = new Map<string, { pending: number; total: number }>();
    for (const q of questionnaires) {
      if (!q.ipsId) continue;
      const cur = loadByIps.get(q.ipsId) ?? { pending: 0, total: 0 };
      cur.total += 1;
      if (pendingStatuses.has(q.status)) cur.pending += 1;
      loadByIps.set(q.ipsId, cur);
    }

    const practitioners: AdminIpsPractitioner[] = ipsUsers.map((u) => {
      const load = loadByIps.get(u.id);
      return {
        id: u.id,
        name: u.prenom || u.name || "IPS",
        email: u.email,
        license: u.medecinLicenseNumber,
        pendingCount: load?.pending ?? 0,
        assignedCount: load?.total ?? 0,
      };
    });

    const queue: AdminIpsQueueItem[] = questionnaires.map((q) => {
      const userCheckIns = checkInsByUser.get(q.userId) ?? [];
      const { isUrgent } = computeUrgentFromCheckIns(userCheckIns);
      const ips = q.ipsId ? ipsById.get(q.ipsId) : null;
      return {
        id: q.id,
        status: q.status,
        bmi: q.bmi,
        patientName: q.user.name?.trim() ? `${q.user.prenom} ${q.user.name}` : q.user.prenom,
        patientEmail: q.user.email,
        ipsName: ips?.name ?? null,
        ipsId: q.ipsId,
        createdAt: q.createdAt.toISOString(),
        isUrgent,
      };
    });

    const stats: AdminIpsStats = {
      practitioners: ipsUsers.length,
      pending: questionnaires.filter((q) => q.status === "SUBMITTED").length,
      underReview: questionnaires.filter((q) => q.status === "UNDER_REVIEW").length,
      unassigned: questionnaires.filter(
        (q) => !q.ipsId && pendingStatuses.has(q.status),
      ).length,
      approved: questionnaires.filter((q) => approvedStatuses.has(q.status)).length,
    };

    return NextResponse.json({ stats, practitioners, queue });
  });
}
