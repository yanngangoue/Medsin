import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { monthlyPriceCentsForMedication } from "@/lib/pricing/glp1-monthly";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("patient/fulfillment/[id]/GET", async () => {
    const session = await auth();
      if (!session?.user?.id || session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
    
      if (isDemoMode()) {
        return NextResponse.json({
          id: "demo",
          medication: "Ozempic",
          dosage: "0,25 mg",
          amountCents: 14900,
          priceLabel: "149 $/mois",
          paymentStatus: "PENDING",
          ipsName: "IPS Anne-sante",
        });
      }
    
      const fulfillment = await prisma.medicationFulfillment.findFirst({
        where: { id, userId: session.user.id },
      });
    
      if (!fulfillment) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const ips = await prisma.user.findUnique({
        where: { id: fulfillment.ipsId },
        select: { prenom: true, name: true },
      });
    
      const amountCents =
        fulfillment.amountCents > 0
          ? fulfillment.amountCents
          : monthlyPriceCentsForMedication(fulfillment.medication);
    
      return NextResponse.json({
        id: fulfillment.id,
        medication: fulfillment.medication,
        dosage: fulfillment.dosage,
        amountCents,
        priceLabel: `${(amountCents / 100).toFixed(0)} $/mois`,
        paymentStatus: fulfillment.paymentStatus,
        ipsName: ips?.prenom ?? ips?.name ?? "IPS Anne-sante",
      });
  });
}
