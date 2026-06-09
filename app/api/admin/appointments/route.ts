import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaffRole } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { toAppointmentWithPatient } from "@/lib/telehealth/appointments-service";

export async function GET(req: Request) {
  return catchRouteError("admin/appointments/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (!isStaffRole(user.role)) return forbidden();
    
      const { searchParams } = new URL(req.url);
      const patientId = searchParams.get("patientId");
      const upcomingOnly = searchParams.get("upcoming") !== "0";
    
      const now = new Date();
      const where = {
        ...(patientId ? { userId: patientId } : {}),
        ...(upcomingOnly
          ? {
              status: "SCHEDULED" as const,
              scheduledAt: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            }
          : {}),
      };
    
      const items = await prisma.appointment.findMany({
        where,
        orderBy: { scheduledAt: "asc" },
        take: 50,
        include: {
          user: { select: { id: true, prenom: true, name: true, email: true } },
        },
      });
    
      return NextResponse.json({
        appointments: items.map(toAppointmentWithPatient),
      });
  });
}
