/** Comptes internes autorisés à simuler le paiement sans Stripe. */
export function isTestBypassEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return lower.endsWith("@medsim.ca") || lower.endsWith("@anne-sante.ca");
}

export function isPublicTestMode(): boolean {
  return process.env.NEXT_PUBLIC_TEST_MODE === "true";
}

export function canSimulatePayment(email: string | null | undefined): boolean {
  return isPublicTestMode() || isTestBypassEmail(email);
}
