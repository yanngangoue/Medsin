/** Sans PostgreSQL : inscription, connexion et questionnaire en mémoire (perdu au redémarrage du serveur). */
export function isDemoMode(): boolean {
  return process.env.MEDSIM_DEMO_MODE === "true";
}
