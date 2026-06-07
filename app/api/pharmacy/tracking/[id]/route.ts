import { NextResponse } from "next/server";
import type { FulfillmentStatus } from "@prisma/client";
import { auth } from "@/auth";
import { resolveCarrierTrackingUrl } from "@/lib/pharmacy/tracking-url";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function formatPrescriptionNumber(fulfillmentId: string): string {
  return `MS-${fulfillmentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function formatDose(dosage: string): string {
  const trimmed = dosage.trim();
  if (/semaine/i.test(trimmed)) return trimmed;
  return `${trimmed}/semaine`;
}

type StepDates = {
  issued: string | null;
  paid: string | null;
  preparation: string | null;
  shipped: string | null;
  delivered: string | null;
};

function datesFromHistory(
  history: { status: FulfillmentStatus; createdAt: Date }[],
  paidAt: Date | null,
  shippedAt: Date | null,
  deliveredAt: Date | null,
  createdAt: Date,
): StepDates {
  const byStatus = (status: FulfillmentStatus) =>
    history.find((h) => h.status === status)?.createdAt.toISOString() ?? null;

  return {
    issued: byStatus("ISSUED") ?? createdAt.toISOString(),
    paid: paidAt?.toISOString() ?? null,
    preparation:
      byStatus("IN_PREPARATION") ??
      byStatus("SENT_TO_PHARMACY") ??
      null,
    shipped: shippedAt?.toISOString() ?? byStatus("SHIPPED"),
    delivered: deliveredAt?.toISOString() ?? byStatus("DELIVERED"),
  };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoMode() || id === "demo") {
    const now = new Date();
    const issued = new Date(now);
    issued.setDate(issued.getDate() - 3);
    const paid = new Date(now);
    paid.setDate(paid.getDate() - 2);
    const eta = new Date(now);
    eta.setDate(eta.getDate() + 2);

    return NextResponse.json({
      id: "demo",
      status: "IN_PREPARATION",
      paymentStatus: "PAID",
      medication: "Ozempic",
      dosage: "0,25 mg/semaine",
      refills: 2,
      trackingNumber: null,
      trackingUrl: null,
      pdfUrl: null,
      prescriptionNumber: "MS-DEMO0001",
      ipsName: "IPS MedSim",
      issuedAt: issued.toISOString(),
      estimatedDelivery: eta.toISOString(),
      stepDates: {
        issued: issued.toISOString(),
        paid: paid.toISOString(),
        preparation: paid.toISOString(),
        shipped: null,
        delivered: null,
      },
      pharmacy: {
        name: "Pharmacie partenaire MedSim",
        address: "1000, rue Sainte-Catherine Ouest",
        city: "Montréal",
        province: "QC",
        phone: "514-555-0100",
      },
    });
  }

  const fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { id, userId: session.user.id },
    include: {
      pharmacy: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!fulfillment) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const ips = await prisma.user.findUnique({
    where: { id: fulfillment.ipsId },
    select: { prenom: true, name: true },
  });

  const trackingUrl = resolveCarrierTrackingUrl(
    fulfillment.trackingNumber,
    fulfillment.trackingUrl,
  );

  const pharmacy = fulfillment.pharmacy
    ? {
        name: fulfillment.pharmacy.name,
        address: fulfillment.pharmacy.address,
        city: fulfillment.pharmacy.city,
        province: fulfillment.pharmacy.province,
        phone: fulfillment.pharmacy.phone,
      }
    : null;

  return NextResponse.json({
    id: fulfillment.id,
    status: fulfillment.status,
    paymentStatus: fulfillment.paymentStatus,
    trackingNumber: fulfillment.trackingNumber,
    trackingUrl,
    pdfUrl: fulfillment.pdfUrl,
    medication: fulfillment.medication,
    dosage: formatDose(fulfillment.dosage),
    refills: fulfillment.refills,
    prescriptionNumber: formatPrescriptionNumber(fulfillment.id),
    ipsName: ips?.prenom ?? ips?.name ?? "IPS MedSim",
    issuedAt: fulfillment.pdfGeneratedAt?.toISOString() ?? fulfillment.createdAt.toISOString(),
    estimatedDelivery: fulfillment.estimatedDelivery?.toISOString() ?? null,
    stepDates: datesFromHistory(
      fulfillment.statusHistory,
      fulfillment.paidAt,
      fulfillment.shippedAt,
      fulfillment.deliveredAt,
      fulfillment.createdAt,
    ),
    pharmacy,
  });
}
