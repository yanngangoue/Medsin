import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

/** Dernière ordonnance / fulfillment du patient connecté. */
export async function GET() {
  return catchRouteError("patient/fulfillment", async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      fulfillment: {
        id: "demo",
        medication: "Ozempic",
        paymentStatus: "PENDING",
        status: "ISSUED",
      },
    });
  }

  const fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      medication: true,
      paymentStatus: true,
      status: true,
    },
  });

  return NextResponse.json({ fulfillment });
  });
}
