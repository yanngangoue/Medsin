import { NextResponse } from "next/server";
import Stripe from "stripe";
import { processFulfillmentPayment } from "@/lib/stripe/fulfillment-after-payment";

export const runtime = "nodejs";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error("[stripe webhook] signature", e);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const fulfillmentId = session.metadata?.prescriptionId ?? session.metadata?.fulfillmentId;
    const userId = session.metadata?.userId ?? session.client_reference_id;

    if (fulfillmentId && session.payment_status === "paid") {
      await processFulfillmentPayment(
        fulfillmentId,
        session.id,
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      );
    } else if (userId && session.metadata?.product === "weight-program") {
      /* abonnement programme poids legacy — géré ailleurs */
    }
  }

  return NextResponse.json({ received: true });
}
