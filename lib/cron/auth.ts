/** Vérifie l'autorisation des jobs cron (Bearer MEDSIM_CRON_SECRET). */
export function authorizeCron(req: Request): boolean {
  const secret =
    process.env.MEDSIM_CRON_SECRET?.trim() ?? process.env.CRON_SECRET?.trim();
  if (!secret) {
    // En dev uniquement si la variable opt-in est définie explicitement
    return (
      process.env.NODE_ENV === "development" &&
      process.env.MEDSIM_ENABLE_DEV_CRON === "true"
    );
  }
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
