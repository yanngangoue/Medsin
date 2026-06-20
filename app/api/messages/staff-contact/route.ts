import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";

/** Premier professionnel disponible pour la messagerie patient (MVP). */
export async function GET() {
  return catchRouteError("messages/staff-contact/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (user.role !== "PATIENT") return forbidden();
    
      const staff = await prisma.user.findFirst({
        where: { role: { in: ["MEDECIN", "ADMIN"] } },
        orderBy: { createdAt: "asc" },
        select: { id: true, prenom: true, name: true, role: true },
      });
    
      return NextResponse.json({
        peer: staff
          ? { id: staff.id, prenom: staff.prenom || staff.name || "Équipe Anne-sante", role: staff.role }
          : null,
      });
  });
}
