/**
 * Chemins accessibles sans session (connexion, reset MDP, APIs auth, interop).
 */
export function isPublicAuthPath(pathname: string): boolean {
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === "/connexion" || pathname.startsWith("/connexion/")) return true;
  if (pathname === "/acces-refuse") return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/interop")) return true;
  if (pathname.startsWith("/api/dev")) return true;
  return false;
}
