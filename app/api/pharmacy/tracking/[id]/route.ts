import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { FulfillmentStatus } from "@prisma/client";
import { auth } from "@/auth";
import {
  formatPrescriptionNumber,
  notifyFulfillmentStatusChange,
} from "@/lib/pharmacy/fulfillment-notify";
import { resolveCarrierTrackingUrl, carrierLabelFromTracking } from "@/lib/pharmacy/tracking-url";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function formatDose(dosage: string): string {
  const trimmed = dosage.trim();
  if (/semaine/i.test(trimmed)) return trimmed;
  return `${trimmed}/semaine`;
}

type StepDates = {
  issued: string | null;
  paid: string | null;
  sentToPharmacy: string | null;
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
    sentToPharmacy: byStatus("SENT_TO_PHARMACY"),
    preparation:
      byStatus("IN_PREPARATION") ?? byStatus("SENT_TO_PHARMACY") ?? null,
    shipped: shippedAt?.toISOString() ?? byStatus("SHIPPED"),
    delivered: deliveredAt?.toISOString() ?? byStatus("DELIVERED"),
  };
}

function buildTrackingPayload(fulfillment: {
  id: string;
  status: FulfillmentStatus;
  paymentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  pdfUrl: string | null;
  medication: string;
  dosage: string;
  refills: number;
  estimatedDelivery: Date | null;
  pdfGeneratedAt: Date | null;
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  updatedAt: Date;
  statusHistory: { status: FulfillmentStatus; createdAt: Date }[];
  pharmacy: {
    name: string;
    address: string;
    city: string;
    province: string;
    phone: string;
  } | null;
  ipsId: string;
}) {
  const trackingUrl = resolveCarrierTrackingUrl(
    fulfillment.trackingNumber,
    fulfillment.trackingUrl,
  );

  return {
    id: fulfillment.id,
    status: fulfillment.status,
    paymentStatus: fulfillment.paymentStatus,
    trackingNumber: fulfillment.trackingNumber,
    trackingUrl,
    carrierLabel: carrierLabelFromTracking(fulfillment.trackingNumber),
    pdfUrl: fulfillment.pdfUrl,
    medication: fulfillment.medication,
    dosage: formatDose(fulfillment.dosage),
    refills: fulfillment.refills,
    prescriptionNumber: formatPrescriptionNumber(fulfillment.id),
    pharmacyName: fulfillment.pharmacy?.name ?? "Pharmacie partenaire Anne-sante",
    lastUpdated: fulfillment.updatedAt.toISOString(),
    issuedAt:
      fulfillment.pdfGeneratedAt?.toISOString() ?? fulfillment.createdAt.toISOString(),
    estimatedDelivery: fulfillment.estimatedDelivery?.toISOString() ?? null,
    stepDates: datesFromHistory(
      fulfillment.statusHistory,
      fulfillment.paidAt,
      fulfillment.shippedAt,
      fulfillment.deliveredAt,
      fulfillment.createdAt,
    ),
    pharmacy: fulfillment.pharmacy
      ? {
          name: fulfillment.pharmacy.name,
          address: fulfillment.pharmacy.address,
          city: fulfillment.pharmacy.city,
          province: fulfillment.pharmacy.province,
          phone: fulfillment.pharmacy.phone,
        }
      : null,
    ipsId: fulfillment.ipsId,
  };
}

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("pharmacy/tracking/[id]/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
    
      if (isDemoMode() || id === "demo") {
        const now = new Date();
        const issued = new Date(now);
        issued.setDate(issued.getDate() - 3);
        const paid = new Date(now);
        paid.setDate(paid.getDate() - 2);
        const sent = new Date(now);
        sent.setDate(sent.getDate() - 1);
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
          carrierLabel: "Purolator",
          pdfUrl: null,
          prescriptionNumber: "MS-DEMO0001",
          ipsName: "IPS Anne-sante",
          pharmacyName: "Pharmacie partenaire Anne-sante",
          lastUpdated: now.toISOString(),
          issuedAt: issued.toISOString(),
          estimatedDelivery: eta.toISOString(),
          stepDates: {
            issued: issued.toISOString(),
            paid: paid.toISOString(),
            sentToPharmacy: sent.toISOString(),
            preparation: sent.toISOString(),
            shipped: null,
            delivered: null,
          },
          pharmacy: {
            name: "Pharmacie partenaire Anne-sante",
            address: "1000, rue Sainte-Catherine Ouest",
            city: "Montréal",
            province: "QC",
            phone: "514-555-0100",
          },
        });
      }
    
      const isAdmin = session.user.role === "ADMIN";
      const fulfillment = await prisma.medicationFulfillment.findFirst({
        where: isAdmin ? { id } : { id, userId: session.user.id },
        include: {
          pharmacy: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });
    
      if (!fulfillment) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const ips = await prisma.user.findUnique({
        where: { id: fulfillment.ipsId },
        select: { prenom: true, name: true },
      });
    
      const payload = buildTrackingPayload(fulfillment);
    
      return NextResponse.json({
        ...payload,
        ipsName: ips?.prenom ?? ips?.name ?? "IPS Anne-sante",
      });
  });
}

const patchSchema = z.object({
  status: z.enum(["ISSUED", "SENT_TO_PHARMACY", "IN_PREPARATION", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().trim().optional(),
  trackingUrl: z.string().url().optional().or(z.literal("")),
});

/** Mise à jour manuelle du statut (admin). */
export async function PATCH(req: Request, { params }: Params) {
  return catchRouteError("pharmacy/tracking/[id]/PATCH", async () => {
    const session = await auth();
      if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Accès réservé aux administrateurs", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const { id } = await params;
      const body: unknown = await req.json().catch(() => null);
      const parsed = patchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      const fulfillment = await prisma.medicationFulfillment.findUnique({
        where: { id },
        include: { statusHistory: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
    
      if (!fulfillment) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const { status, trackingNumber, trackingUrl } = parsed.data;
      const prevStatus = fulfillment.status;
    
      if (prevStatus === status && !trackingNumber && trackingUrl === undefined) {
        return NextResponse.json({ ok: true, unchanged: true });
      }
    
      const now = new Date();
      const updateData: {
        status: FulfillmentStatus;
        trackingNumber?: string;
        trackingUrl?: string | null;
        shippedAt?: Date;
        deliveredAt?: Date;
      } = { status };
    
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (trackingUrl !== undefined) {
        updateData.trackingUrl = trackingUrl || resolveCarrierTrackingUrl(trackingNumber ?? null, null);
      } else if (trackingNumber) {
        updateData.trackingUrl = resolveCarrierTrackingUrl(trackingNumber, null);
      }
    
      if (status === "SHIPPED" && !fulfillment.shippedAt) updateData.shippedAt = now;
      if (status === "DELIVERED" && !fulfillment.deliveredAt) updateData.deliveredAt = now;
    
      await prisma.medicationFulfillment.update({
        where: { id },
        data: updateData,
      });
    
      if (prevStatus !== status) {
        await prisma.fulfillmentStatusHistory.create({
          data: {
            fulfillmentId: id,
            status,
            note: "Mise à jour manuelle admin",
          },
        });
        await notifyFulfillmentStatusChange(id, status);
      }
    
      const updated = await prisma.medicationFulfillment.findUnique({
        where: { id },
        include: {
          pharmacy: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });
    
      if (!updated) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      return NextResponse.json(buildTrackingPayload(updated));
  });
}
