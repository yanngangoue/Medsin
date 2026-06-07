import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques — pas de vérification
  const publicRoutes = [
    "/",
    "/eligibilite",
    "/eligibilite/resultat",
    "/connexion",
    "/auth/connexion",
    "/auth/inscription",
    "/auth/inscription",
    "/confidentialite",
    "/politique-confidentialite",
    "/conditions-utilisation",
    "/politique-remboursement",
    "/conformite",
    "/garantie",
    "/contact",
    "/projet",
    "/acces-refuse",
  ];

  // Routes API publiques
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/onboarding/eligibilite") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Vérifier si route publique
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Vérifier le token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Non connecté → rediriger vers connexion
  if (!token) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Protection dashboard IPS
  if (pathname.startsWith("/dashboard/ips") && role !== "IPS") {
    return NextResponse.redirect(new URL("/acces-refuse", request.url));
  }

  // Protection dashboard médecin
  if (pathname.startsWith("/medecin") && role !== "MEDECIN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/acces-refuse", request.url));
  }

  // Protection dashboard admin
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/acces-refuse", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
