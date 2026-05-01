import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionPayload } from "@/lib/auth";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key);
}

export async function createCheckoutSession() {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID non configuré — ajoutez un prix dans .env" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
    client_reference_id: session.sub,
    customer_email: session.email,
    metadata: { userId: session.sub },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Impossible de créer la session" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}
