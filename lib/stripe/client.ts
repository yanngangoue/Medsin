import Stripe from "stripe";

let stripeClient: Stripe | null = null;
let stripeClientKey: string | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquant");
  }
  if (!stripeClient || stripeClientKey !== key) {
    stripeClient = new Stripe(key);
    stripeClientKey = key;
  }
  return stripeClient;
}

export function stripeErrorMessage(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case "StripeCardError":
        return "Votre carte a été refusée. Veuillez essayer une autre carte.";
      case "StripeRateLimitError":
        return "Trop de requêtes — réessayez dans quelques instants.";
      case "StripeInvalidRequestError":
        return "Requête de paiement invalide. Contactez le soutien Anne-sante.";
      case "StripeAPIError":
      case "StripeConnectionError":
        return "Stripe est temporairement indisponible. Réessayez plus tard.";
      case "StripeAuthenticationError":
        return "Configuration Stripe invalide (clé secrète).";
      default:
        return error.message || "Erreur Stripe";
    }
  }
  if (error instanceof Error) return error.message;
  return "Erreur de paiement inattendue";
}
