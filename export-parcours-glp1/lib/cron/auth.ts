/** Vérifie l'autorisation des jobs cron (Bearer MEDSIM_CRON_SECRET). */
export function authorizeCron(req: Request): boolean {
  const secret =
    process.env.MEDSIM_CRON_SECRET?.trim() ?? process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
