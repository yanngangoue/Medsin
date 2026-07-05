import { timingSafeEqual } from "node:crypto";

/** Vérifie l'autorisation des jobs cron (Bearer MEDSIM_CRON_SECRET). */
export function authorizeCron(req: Request): boolean {
  const secret = process.env.MEDSIM_CRON_SECRET?.trim() ?? process.env.CRON_SECRET?.trim();
  // Aucun fallback sans secret configuré — jamais d'accès libre
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  try {
    const a = Buffer.from(header);
    const b = Buffer.from(expected);
    // Longueur différente = pas égal, mais on compare quand même pour éviter timing leak
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
