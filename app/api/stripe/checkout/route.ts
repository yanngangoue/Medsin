import { createCheckoutSession } from "@/controllers/stripeController";

export async function POST() {
  try {
    return await createCheckoutSession();
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Stripe indisponible" }, { status: 500 });
  }
}
