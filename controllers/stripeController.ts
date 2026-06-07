import { NextResponse } from "next/server";
import Stripe from "stripe";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key);
}

type CheckoutBody = {
  fulfillmentId?: string;
};

/** Abonnement mensuel GLP-1 ou programme poids legacy. */
export async function createCheckoutSession(req?: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.role !== "PATIENT") return forbidden();

  const body: CheckoutBody | null = req
    ? ((await req.json().catch(() => null)) as CheckoutBody | null)
    : null;

  const priceId = process.env.STRIPE_PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID non configuré — ajoutez un prix dans .env" },
      { status: 503 },
    );
  }

  const fulfillmentId = body?.fulfillmentId?.trim();
  let pharmacyId: string | undefined;
  let metadata: Record<string, string> = {
    userId: user.id,
    product: "weight-program",
  };

  if (fulfillmentId) {
    if (isDemoMode()) {
      return NextResponse.json({ error: "Paiement indisponible en mode démo" }, { status: 503 });
    }

    const fulfillment = await prisma.medicationFulfillment.findFirst({
      where: { id: fulfillmentId, userId: user.id },
    });

    if (!fulfillment) {
      return NextResponse.json({ error: "Ordonnance introuvable" }, { status: 404 });
    }

    if (fulfillment.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Déjà payé" }, { status: 409 });
    }

    pharmacyId = fulfillment.pharmacyId ?? undefined;
    metadata = {
      userId: user.id,
      prescriptionId: fulfillment.id,
      fulfillmentId: fulfillment.id,
      product: "glp1-medication",
      ...(pharmacyId ? { pharmacyId } : {}),
    };
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: fulfillmentId
      ? `${baseUrl}/dashboard/patient?paid=1`
      : `${baseUrl}/dashboard/patient/poids?tab=programme&checkout=success`,
    cancel_url: fulfillmentId
      ? `${baseUrl}/paiement?cancelled=1&fulfillment=${fulfillmentId}`
      : `${baseUrl}/onboarding/gestion-poids?checkout=cancel`,
    client_reference_id: user.id,
    ...(user.email ? { customer_email: user.email } : {}),
    metadata,
  });

  if (fulfillmentId) {
    await prisma.medicationFulfillment.update({
      where: { id: fulfillmentId },
      data: { stripeSessionId: checkout.id },
    });
  }

  if (!checkout.url) {
    return NextResponse.json({ error: "Impossible de créer la session" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}
