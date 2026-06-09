import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function GET() {
  return catchRouteError("gdpr/access-log/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ entries: [] });
      }
    
      const entries = await prisma.auditLog.findMany({
        where: {
          action: "medical_record_access",
          OR: [{ entity: session.user.id }, { resourceId: session.user.id }],
        },
        orderBy: { timestamp: "desc" },
        take: 100,
        select: {
          id: true,
          action: true,
          resource: true,
          userId: true,
          timestamp: true,
        },
      });
    
      return NextResponse.json({ entries });
  });
}
