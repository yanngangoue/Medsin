import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoMode() || id === "demo") {
    return NextResponse.json({
      status: "IN_PREPARATION",
      trackingNumber: null,
      trackingUrl: null,
      pdfUrl: null,
    });
  }

  const fulfillment = await prisma.medicationFulfillment.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!fulfillment) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    status: fulfillment.status,
    trackingNumber: fulfillment.trackingNumber,
    trackingUrl: fulfillment.trackingUrl,
    pdfUrl: fulfillment.pdfUrl,
  });
}
