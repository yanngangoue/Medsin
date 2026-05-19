/**
 * Page de test interop / métabolisme — désactivée en production sauf opt-in explicite.
 */
export function isDevInteropTestPageEnabled(): boolean {
  const explicit = process.env.MEDSIM_ENABLE_DEV_INTEROP_PAGE;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV === "development";
}
