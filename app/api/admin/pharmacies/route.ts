import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { formatPrescriptionNumber } from "@/lib/pharmacy/fulfillment-notify";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

export type AdminPharmacyOrder = {
  id: string;
  prescriptionNumber: string;
  status: string;
  paymentStatus: string;
  medication: string;
  dosage: string;
  trackingNumber: string | null;
  patientName: string;
  patientEmail: string;
  deliveryHint: string;
  pharmacyName: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type AdminPharmacyStats = {
  pending: number;
  shipped: number;
  delivered: number;
  avgDeliveryDays: number | null;
};

export async function GET() {
  return catchRouteError("admin/pharmacies/GET", async () => {
    const session = await auth();
      if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Accès réservé aux administrateurs", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({
          stats: { pending: 2, shipped: 1, delivered: 5, avgDeliveryDays: 3.2 } satisfies AdminPharmacyStats,
          orders: [] as AdminPharmacyOrder[],
        });
      }
    
      const [orders, pending, shipped, delivered, deliveredRows] = await Promise.all([
        prisma.medicationFulfillment.findMany({
          where: {
            paymentStatus: "PAID",
            status: { in: ["SENT_TO_PHARMACY", "IN_PREPARATION", "SHIPPED"] },
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
          include: {
            user: { select: { prenom: true, name: true, email: true } },
            pharmacy: { select: { name: true } },
            questionnaire: { select: { draftJson: true } },
          },
        }),
        prisma.medicationFulfillment.count({
          where: {
            paymentStatus: "PAID",
            status: { in: ["SENT_TO_PHARMACY", "IN_PREPARATION"] },
          },
        }),
        prisma.medicationFulfillment.count({
          where: { status: "SHIPPED" },
        }),
        prisma.medicationFulfillment.count({
          where: { status: "DELIVERED" },
        }),
        prisma.medicationFulfillment.findMany({
          where: { status: "DELIVERED", paidAt: { not: null }, deliveredAt: { not: null } },
          select: { paidAt: true, deliveredAt: true },
          take: 100,
        }),
      ]);
    
      let avgDeliveryDays: number | null = null;
      if (deliveredRows.length > 0) {
        const totalDays = deliveredRows.reduce((sum, r) => {
          const days =
            (r.deliveredAt!.getTime() - r.paidAt!.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        avgDeliveryDays = Math.round((totalDays / deliveredRows.length) * 10) / 10;
      }
    
      function deliveryHint(draftJson: unknown, email: string): string {
        if (draftJson && typeof draftJson === "object") {
          const d = draftJson as Record<string, unknown>;
          const addr = [d.deliveryAddress, d.adresseLivraison, d.address, d.city, d.ville]
            .filter((v) => typeof v === "string" && v.trim())
            .join(", ");
          if (addr) return addr;
        }
        return email;
      }
    
      const list: AdminPharmacyOrder[] = orders.map((o) => ({
        id: o.id,
        prescriptionNumber: formatPrescriptionNumber(o.id),
        status: o.status,
        paymentStatus: o.paymentStatus,
        medication: o.medication,
        dosage: o.dosage,
        trackingNumber: o.trackingNumber,
        patientName: o.user.prenom || o.user.name || "Patient",
        patientEmail: o.user.email,
        deliveryHint: deliveryHint(o.questionnaire.draftJson, o.user.email),
        pharmacyName: o.pharmacy?.name ?? null,
        paidAt: o.paidAt?.toISOString() ?? null,
        createdAt: o.createdAt.toISOString(),
      }));
    
      return NextResponse.json({
        stats: { pending, shipped, delivered, avgDeliveryDays } satisfies AdminPharmacyStats,
        orders: list,
      });
  });
}
