import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return catchRouteError("pharmacien/fulfillments/GET", async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "PHARMACIEN") {
      return NextResponse.json({ error: "Accès réservé aux pharmaciens" }, { status: 403 });
    }

    const pharmacien = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pharmacyPartnerId: true },
    });

    // SECURITY: refuse access if pharmacist is not linked to a pharmacy.
    // Without this guard, findMany({}) would expose every patient record (IDOR).
    if (!pharmacien?.pharmacyPartnerId) {
      return NextResponse.json(
        { error: "Compte pharmacien non associé à une pharmacie partenaire" },
        { status: 403 },
      );
    }

    const fulfillments = await prisma.medicationFulfillment.findMany({
      where: { pharmacyId: pharmacien.pharmacyPartnerId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { prenom: true, name: true } },
        pharmacy: { select: { name: true } },
      },
    });

    return NextResponse.json({
      fulfillments: fulfillments.map((f) => ({
        id: f.id,
        patientName: f.user.prenom ?? f.user.name ?? "—",
        medication: f.medication,
        dosage: f.dosage,
        status: f.status,
        paymentStatus: f.paymentStatus,
        trackingNumber: f.trackingNumber,
        createdAt: f.createdAt.toISOString(),
        shippedAt: f.shippedAt?.toISOString() ?? null,
        estimatedDelivery: f.estimatedDelivery?.toISOString() ?? null,
      })),
    });
  });
}
