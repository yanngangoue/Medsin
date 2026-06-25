import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { isDemoMode } from "@/lib/is-demo-mode";
import { getStripe, stripeErrorMessage } from "@/lib/stripe/client";
import { getStripeIpePriceId } from "@/lib/stripe/env";
import { GLP1_MONTHLY_PRICE_CENTS } from "@/lib/membership/glp1-membership";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { checkApiRateLimit, clientIp } from "@/lib/api-rate-limit";

type CheckoutBody = {
  fulfillmentId?: string;
  purpose?: "onboarding" | "fulfillment";
};

export async function POST(req: Request) {
  return catchRouteError("stripe/checkout/POST", async () => {
    try {
        if (!checkApiRateLimit("stripe-checkout", clientIp(req), 5)) {
          return NextResponse.json(
            { error: "Trop de tentatives. Réessayez dans 15 minutes.", code: "RATE_LIMITED" },
            { status: 429 },
          );
        }

        const user = await getSessionUser();
        if (!user) return unauthorized();
        if (user.role !== "PATIENT") return forbidden();
    
        if (isDemoMode()) {
          return NextResponse.json({ error: "Paiement indisponible en mode démo", code: "SERVICE_UNAVAILABLE" }, { status: 503 });
        }
    
        if (!process.env.STRIPE_SECRET_KEY?.trim()) {
          return NextResponse.json(
            { error: "Paiement non configuré — ajoutez STRIPE_SECRET_KEY dans .env" },
            { status: 503 },
          );
        }
    
        const body = (await req.json().catch(() => null)) as CheckoutBody | null;
        const purpose = body?.purpose ?? "fulfillment";
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
        const priceId = getStripeIpePriceId();
        const stripe = getStripe();

        if (purpose === "onboarding") {
          return NextResponse.json(
            {
              error:
                "Complétez d'abord votre questionnaire médical. Le paiement intervient après approbation IPS.",
              code: "INVALID_FLOW",
            },
            { status: 400 },
          );
        }

        const fulfillmentIdFromBody = body?.fulfillmentId?.trim();
    
        const fulfillment = fulfillmentIdFromBody
          ? await prisma.medicationFulfillment.findFirst({
              where: { id: fulfillmentIdFromBody, userId: user.id },
              include: { questionnaire: { select: { status: true } } },
            })
          : await prisma.medicationFulfillment.findFirst({
              where: { userId: user.id, paymentStatus: "PENDING" },
              orderBy: { createdAt: "desc" },
              include: { questionnaire: { select: { status: true } } },
            });
    
        if (!fulfillment) {
          return NextResponse.json(
            { error: "Aucune ordonnance en attente de paiement" },
            { status: 404 },
          );
        }

        const approved =
          fulfillment.questionnaire.status === "APPROVED" ||
          fulfillment.questionnaire.status === "PRESCRIPTION_ISSUED";
        if (!approved) {
          return NextResponse.json(
            { error: "Votre dossier doit être approuvé par une IPS avant le paiement", code: "FORBIDDEN" },
            { status: 403 },
          );
        }
    
        if (fulfillment.paymentStatus === "PAID") {
          return NextResponse.json({ error: "Cette ordonnance est déjà payée", code: "CONFLICT" }, { status: 409 });
        }
    
        const amountCents =
          fulfillment.amountCents > 0 ? fulfillment.amountCents : GLP1_MONTHLY_PRICE_CENTS;

        const checkout = await stripe.checkout.sessions.create({
          mode: "subscription",
          success_url: `${baseUrl}/paiement?paid=1&fulfillment=${encodeURIComponent(fulfillment.id)}`,
          cancel_url: `${baseUrl}/paiement?cancelled=1&fulfillment=${encodeURIComponent(fulfillment.id)}`,
          client_reference_id: user.id,
          ...(user.email ? { customer_email: user.email } : {}),
          metadata: {
            userId: user.id,
            prescriptionId: fulfillment.id,
            fulfillmentId: fulfillment.id,
            product: "glp1-medication",
            ...(fulfillment.pharmacyId ? { pharmacyId: fulfillment.pharmacyId } : {}),
          },
          subscription_data: {
            metadata: {
              userId: user.id,
              prescriptionId: fulfillment.id,
            },
          },
          line_items: priceId
            ? [{ price: priceId, quantity: 1 }]
            : [
                {
                  price_data: {
                    currency: "cad",
                    product_data: {
                      name: "Anne-sante — Programme GLP-1",
                      description: "Suivi IPS + Coach Anne + Livraison",
                    },
                    unit_amount: amountCents,
                    recurring: { interval: "month" },
                  },
                  quantity: 1,
                },
              ],
        });
    
        await prisma.medicationFulfillment.update({
          where: { id: fulfillment.id },
          data: {
            stripeSessionId: checkout.id,
            ...(fulfillment.amountCents === 0 ? { amountCents } : {}),
          },
        });
    
        if (!checkout.url) {
          return NextResponse.json({ error: "Impossible de créer la session Stripe", code: "INTERNAL_ERROR" }, { status: 500 });
        }
    
        return NextResponse.json({ url: checkout.url });
      } catch (e) {
        console.error("[stripe checkout]", e);
        return NextResponse.json({ error: stripeErrorMessage(e) }, { status: 500 });
      }
  });
}
