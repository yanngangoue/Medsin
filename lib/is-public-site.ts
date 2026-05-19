/** Site entièrement navigable sans connexion (désactiver avec MEDSIM_PUBLIC_MODE=false). */
export function isPublicSiteMode(): boolean {
  return process.env.MEDSIM_PUBLIC_MODE !== "false";
}
