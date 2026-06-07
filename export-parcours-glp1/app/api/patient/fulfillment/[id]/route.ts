import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { monthlyPriceLabelForMedication } from "@/lib/pricing/glp1-monthly";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoMode()) {
    return NextResponse.json({
      medication: "Ozempic",
      amountCents: 14900,
      priceLabel: "149 $/mois",
      paymentStatus: "PENDING",
    });
  }

  const fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!fulfillment) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    medication: fulfillment.medication,
    amountCents: fulfillment.amountCents,
    priceLabel: monthlyPriceLabelForMedication(fulfillment.medication),
    paymentStatus: fulfillment.paymentStatus,
  });
}
