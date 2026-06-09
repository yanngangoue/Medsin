import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { hasCheckInThisWeekQuebec } from "@/lib/anne/schedule";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { getVideoJoinWindow } from "@/lib/telehealth/video-consultation";
import { loadPatientHubContext } from "@/lib/patient/load-patient-hub-context";

export async function GET() {
  return catchRouteError("patient/notifications/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (user.role !== "PATIENT") return forbidden();
    
      const now = new Date();
      const hubContext = await loadPatientHubContext(user.id);
    
      const [unreadMessages, nextAppointment, weightProgram] = await Promise.all([
        prisma.message.count({
          where: { receiverId: user.id, read: false },
        }),
        prisma.appointment.findFirst({
          where: {
            userId: user.id,
            status: "SCHEDULED",
            scheduledAt: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
          },
          orderBy: { scheduledAt: "asc" },
          select: { id: true, scheduledAt: true },
        }),
        prisma.weightProgram.findUnique({
          where: { userId: user.id },
          include: {
            checkIns: { orderBy: { recordedAt: "desc" }, take: 14 },
          },
        }),
      ]);
    
      let upcomingVideo = false;
      if (nextAppointment) {
        upcomingVideo = getVideoJoinWindow(nextAppointment.scheduledAt).canJoin;
      }
    
      const checkInPending =
        weightProgram != null &&
        weightProgram.status === "ACTIVE" &&
        weightProgram.isActive &&
        !hasCheckInThisWeekQuebec(weightProgram.checkIns);
    
      return NextResponse.json({
        unreadMessages,
        upcomingVideo,
        nextAppointmentId: nextAppointment?.id ?? null,
        hasGlp1Dossier: Boolean(hubContext.hasGlp1Dossier),
        checkInPending,
      });
  });
}
