import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessPath, requiredRoleForPath } from "@/lib/rbac";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const required = requiredRoleForPath(pathname);
  if (!required) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (!role) {
    const login = new URL("/auth/connexion", req.url);
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
  ],
};
