import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startOfWeekMonday, nextMondayAt9h, formatFrDate } from "@/lib/anne/schedule";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export type AnneWeeklyStatus = {
  mondayCheckInSent: boolean;
  fridayReportSent: boolean;
  nextReminderLabel: string;
  reportCount: number;
};

export async function GET() {
  return catchRouteError("patient/coach-ia/weekly-status/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        const next = nextMondayAt9h();
        return NextResponse.json({
          mondayCheckInSent: true,
          fridayReportSent: false,
          nextReminderLabel: formatFrDate(next),
          reportCount: 0,
        } satisfies AnneWeeklyStatus);
      }
    
      const userId = session.user.id;
      const weekStart = startOfWeekMonday();
    
      const [mondayMessage, weeklyReport, reportCount] = await Promise.all([
        prisma.aiCoachMessage.findFirst({
          where: {
            userId,
            isProactive: true,
            createdAt: { gte: weekStart },
            content: { contains: "check-in" },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.anneIpsReport.findFirst({
          where: {
            userId,
            kind: "WEEKLY",
            createdAt: { gte: weekStart },
          },
        }),
        prisma.anneIpsReport.count({ where: { userId } }),
      ]);
    
      const weekCheckIn = await prisma.weightCheckIn.findFirst({
        where: { userId, recordedAt: { gte: weekStart } },
      });
    
      const next = nextMondayAt9h();
    
      return NextResponse.json({
        mondayCheckInSent: Boolean(mondayMessage || weekCheckIn),
        fridayReportSent: Boolean(weeklyReport),
        nextReminderLabel: formatFrDate(next),
        reportCount,
      } satisfies AnneWeeklyStatus);
  });
}
