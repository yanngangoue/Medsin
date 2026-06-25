function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Adresse de livraison depuis draftJson questionnaire ou medicalHistory. */
export function formatDeliveryAddress(
  draftJson: unknown,
  fallbackEmail: string,
  medicalHistory?: unknown,
): string {
  if (draftJson && typeof draftJson === "object") {
    const d = draftJson as Record<string, unknown>;
    const full = pickString(d.adresseLivraison);
    if (full) return full;

    const street = pickString(d.deliveryAddress, d.address, d.street);
    const city = pickString(d.deliveryCity, d.city, d.ville);
    const province = pickString(d.deliveryProvince, d.province);
    const postal = pickString(d.deliveryPostalCode, d.postalCode, d.codePostal);

    if (street && city) {
      return [street, city, province, postal].filter(Boolean).join(", ");
    }

    const nested = d.delivery as Record<string, unknown> | undefined;
    const nestedFull = pickString(nested?.adresseLivraison);
    if (nestedFull) return nestedFull;
  }

  if (medicalHistory && typeof medicalHistory === "object") {
    const mh = medicalHistory as Record<string, unknown>;
    const delivery = mh.delivery as Record<string, unknown> | undefined;
    const full = pickString(delivery?.adresseLivraison);
    if (full) return full;

    const street = pickString(delivery?.street);
    const city = pickString(delivery?.city);
    const province = pickString(delivery?.province);
    const postal = pickString(delivery?.postalCode);
    if (street && city) {
      return [street, city, province, postal].filter(Boolean).join(", ");
    }
  }

  return `À confirmer — ${fallbackEmail}`;
}
