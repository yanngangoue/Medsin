import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessPath, requiredRoleForPath } from "@/lib/rbac";

const CHANGE_PASSWORD_PATH = "/changer-mot-de-passe";

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Forcer le changement de mot de passe pour les comptes staff nouvellement créés
  const mustChange = req.auth?.user?.mustChangePassword;
  if (mustChange && pathname !== CHANGE_PASSWORD_PATH) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, req.url));
  }

  const required = requiredRoleForPath(pathname);
  if (!required) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (!role) {
    const login = new URL("/connexion", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL("/acces-refuse", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/pharmacien/:path*",
    "/medecin/:path*",
    "/ips/:path*",
    "/questionnaire/:path*",
    "/questionnaire",
    "/paiement/:path*",
    "/paiement",
    "/examen-en-cours",
    "/examen-en-cours/:path*",
    "/nutritionniste",
    "/nutritionniste/:path*",
    "/changer-mot-de-passe",
  ],
};
