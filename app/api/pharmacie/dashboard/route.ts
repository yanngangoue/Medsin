import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

function deliveryFromDraft(draftJson: unknown, email: string): string {
  if (!draftJson || typeof draftJson !== "object") return `À confirmer — ${email}`;
  const d = draftJson as Record<string, unknown>;
  const parts = [
    d.deliveryAddress,
    d.adresseLivraison,
    d.address,
    d.street,
    d.city,
    d.ville,
    d.province,
    d.postalCode,
    d.codePostal,
  ].filter((v) => typeof v === "string" && v.trim()) as string[];
  return parts.length > 0 ? parts.join(", ") : `À confirmer — ${email}`;
}

export async function GET() {
  return catchRouteError("pharmacie/dashboard/GET", async () => {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PHARMACIEN") {
      return NextResponse.json({ error: "Non autorisé", code: "FORBIDDEN" }, { status: 403 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        prenom: session.user.prenom ?? "Pharmacie",
        pharmacyName: "Pharmacie démo",
        fulfillments: [],
      });
    }

    const pharmacien = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        prenom: true,
        pharmacyPartnerId: true,
        pharmacyPartner: { select: { name: true } },
      },
    });

    const fulfillments = await prisma.medicationFulfillment.findMany({
      where: pharmacien?.pharmacyPartnerId
        ? { pharmacyId: pharmacien.pharmacyPartnerId, paymentStatus: "PAID" }
        : { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { prenom: true, name: true, email: true } },
        questionnaire: { select: { draftJson: true } },
      },
    });

    return NextResponse.json({
      prenom: pharmacien?.prenom ?? session.user.prenom ?? "—",
      pharmacyName: pharmacien?.pharmacyPartner?.name ?? null,
      fulfillments: fulfillments.map((f) => ({
        id: f.id,
        status: f.status,
        medication: f.medication,
        dosage: f.dosage,
        trackingNumber: f.trackingNumber,
        pdfUrl: f.pdfUrl,
        createdAt: f.createdAt.toISOString(),
        patientPrenom: f.user.prenom,
        patientNom: f.user.name,
        deliveryAddress: deliveryFromDraft(f.questionnaire.draftJson, f.user.email),
      })),
    });
  });
}
