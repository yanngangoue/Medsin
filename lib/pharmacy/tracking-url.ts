/** Construit une URL de suivi Purolator / Postes Canada si absente en base. */
export function resolveCarrierTrackingUrl(
  trackingNumber: string | null | undefined,
  existingUrl: string | null | undefined,
): string | null {
  if (existingUrl?.trim()) return existingUrl.trim();
  if (!trackingNumber?.trim()) return null;

  const n = trackingNumber.trim().replace(/\s/g, "");

  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(n)) {
    return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(n)}`;
  }

  if (/^\d{10,14}$/.test(n)) {
    return `https://www.purolator.com/en/shipping/tracker?pins=${encodeURIComponent(n)}`;
  }

  return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${encodeURIComponent(n)}`;
}
