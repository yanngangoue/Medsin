/** Variables Stripe — programme IPS / IPE (noms exacts requis en prod). */

function realEnvValue(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v || v.includes("...")) return undefined;
  return v;
}

export function getStripeIpePriceId(): string | undefined {
  return (
    realEnvValue(process.env.STRIPE_IPE_PRICE_ID) ??
    realEnvValue(process.env.STRIPE_PRICE_ID)
  );
}

export function getStripeIpePublishableKey(): string | undefined {
  return (
    realEnvValue(process.env.NEXT_PUBLIC_STRIPE_IPE_PUBLISHABLE_KEY) ??
    realEnvValue(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  );
}

export function getStripeIpeWebhookSecret(): string | undefined {
  return realEnvValue(process.env.STRIPE_IPE_WEBHOOK_SECRET);
}
