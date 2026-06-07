/** Tarifs mensuels indicatifs (CAD) selon le médicament prescrit. */
export function monthlyPriceCentsForMedication(medication: string): number {
  const m = medication.toLowerCase();
  if (m.includes("générique") || m.includes("generique") || m.includes("apo")) return 9900;
  if (m.includes("ozempic")) return 14900;
  if (m.includes("wegovy")) return 19900;
  return 14900;
}

export function monthlyPriceLabelForMedication(medication: string): string {
  const cents = monthlyPriceCentsForMedication(medication);
  return `${(cents / 100).toFixed(0)} $/mois`;
}
