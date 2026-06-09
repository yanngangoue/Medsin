/** Heures ouvrables IPS (Québec) — lun–ven 8 h–17 h, fuseau America/Toronto. */
export function isIpsBusinessHours(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  return isWeekday && hour >= 8 && hour < 17;
}

export const IPS_AWAY_MESSAGE =
  "Votre IPS répond généralement en moins de 24 h. Nous sommes actuellement hors des heures ouvrables (lun–ven, 8 h–17 h). En cas d'urgence médicale, composez le 811 ou le 911.";

export const IPS_RESPONSE_SLA = "Répond généralement en moins de 24 h";
