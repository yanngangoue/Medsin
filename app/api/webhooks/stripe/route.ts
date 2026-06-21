import { catchRouteError } from "@/lib/api/catch-route-error";
import { processStripeWebhook } from "@/lib/stripe/process-webhook";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return catchRouteError("webhooks/stripe/POST", () => processStripeWebhook(req));
}
