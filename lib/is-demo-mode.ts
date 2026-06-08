/** Sans PostgreSQL : inscription, connexion et questionnaire en mémoire (perdu au redémarrage du serveur). */
export function isDemoMode(): boolean {
  // En production (Vercel), toujours Neon/Postgres — le mode démo ne persiste pas sur serverless.
  if (process.env.NODE_ENV === "production") return false;
  return process.env.MEDSIM_DEMO_MODE === "true";
}
