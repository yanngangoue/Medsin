import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyPharmacyFulfillmentAction } from "@/lib/pharmacy/fulfillment-actions";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  action: z.enum(["confirm_receipt", "mark_shipped", "confirm_delivery"]),
  trackingNumber: z.string().trim().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  return catchRouteError("pharmacie/fulfillments/[id]/PATCH", async () => {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PHARMACIEN") {
      return NextResponse.json({ error: "Accès réservé à la pharmacie", code: "FORBIDDEN" }, { status: 403 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const pharmacien = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pharmacyPartnerId: true },
    });

    const { id } = await params;
    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: {
        id,
        ...(pharmacien?.pharmacyPartnerId
          ? { pharmacyId: pharmacien.pharmacyPartnerId }
          : {}),
      },
    });

    if (!fulfillment) {
      return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
    }

    const body: unknown = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const result = await applyPharmacyFulfillmentAction(id, parsed.data.action, {
      trackingNumber: parsed.data.trackingNumber,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: result.status });
  });
}
