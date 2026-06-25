import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processFulfillmentPayment } from "@/lib/stripe/fulfillment-after-payment";
import { canSimulatePayment } from "@/lib/test-mode";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  return catchRouteError("payment/simulate/POST", async () => {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!canSimulatePayment(session.user.email)) {
      return NextResponse.json({ error: "Simulation non autorisée", code: "FORBIDDEN" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { fulfillmentId?: string } | null;
    const fulfillmentId = body?.fulfillmentId?.trim();
    if (!fulfillmentId) {
      return NextResponse.json({ error: "fulfillmentId requis", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { id: fulfillmentId, userId: session.user.id },
      include: { questionnaire: { select: { status: true } } },
    });

    if (!fulfillment) {
      return NextResponse.json({ error: "Ordonnance introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    if (fulfillment.questionnaire.status !== "APPROVED" && fulfillment.questionnaire.status !== "PRESCRIPTION_ISSUED") {
      return NextResponse.json({ error: "Dossier non approuvé", code: "FORBIDDEN" }, { status: 403 });
    }

    if (fulfillment.paymentStatus === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    await processFulfillmentPayment(
      fulfillmentId,
      `sim_${fulfillmentId}`,
      null,
      `sim_sub_${fulfillmentId}`,
    );

    return NextResponse.json({ ok: true });
  });
}
