import { auth } from "./auth.edge";
import { defaultHomeForRole, requiredRoleForPath } from "@/lib/rbac";

const PUBLIC_PREFIXES = [
  "/eligibilite",
  "/auth/inscription",
  "/connexion",
  "/medicaments",
  "/confidentialite",
] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function loginRedirect(req: Request, pathname: string): Response {
  const login = new URL("/connexion", req.url);
  login.searchParams.set("callbackUrl", pathname);
  return Response.redirect(login);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (isPublicPath(pathname)) {
    return;
  }

  if (
    pathname === "/questionnaire" ||
    pathname === "/paiement" ||
    pathname === "/examen-en-cours"
  ) {
    if (!session) {
      return loginRedirect(req, pathname);
    }
    if (session.user.role !== "PATIENT") {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    return;
  }

  if (pathname.startsWith("/dashboard/patient")) {
    if (!session) {
      return loginRedirect(req, pathname);
    }
    if (session.user.role !== "PATIENT") {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    return;
  }

  if (pathname.startsWith("/dashboard/ips")) {
    if (!session) {
      return loginRedirect(req, pathname);
    }
    if (session.user.role !== "IPS") {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    return;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return loginRedirect(req, pathname);
    }
    return Response.redirect(new URL(defaultHomeForRole(session.user.role), req.url));
  }

  const required = requiredRoleForPath(pathname);
  if (!required) {
    return;
  }

  if (!session) {
    return loginRedirect(req, pathname);
  }

  if (session.user.role !== required) {
    return Response.redirect(new URL("/acces-refuse", req.url));
  }
});

export const config = {
  matcher: [
    "/questionnaire",
    "/paiement",
    "/examen-en-cours",
    "/dashboard/:path*",
    "/patient/:path*",
    "/pharmacien/:path*",
    "/medecin/:path*",
    "/nutritionniste/:path*",
    "/admin/:path*",
  ],
};
