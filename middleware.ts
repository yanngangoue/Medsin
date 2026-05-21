import { auth } from "./auth.edge";
import {
  canAccessAdminPath,
  defaultHomeForRole,
  requiredRoleForPath,
} from "@/lib/rbac";
import { isPublicSiteMode } from "@/lib/is-public-site";
import { isPublicAuthPath } from "@/lib/public-auth-paths";

function loginRedirect(req: Request, pathname: string) {
  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }
  const login = new URL("/auth/connexion", req.url);
  login.searchParams.set("callbackUrl", pathname);
  return Response.redirect(login);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (isPublicAuthPath(pathname)) return;

  if (pathname.startsWith("/admin")) {
    if (!session) return loginRedirect(req, pathname);
    if (!canAccessAdminPath(session.user.role)) {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    if (pathname === "/admin" || pathname === "/admin/") {
      return Response.redirect(new URL("/admin/dashboard", req.url));
    }
    return;
  }

  if (pathname.startsWith("/dashboard/patient")) {
    if (!session) return loginRedirect(req, pathname);
    if (session.user.role !== "PATIENT") {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    return;
  }

  if (!isPublicSiteMode()) {
    if (!session) return loginRedirect(req, pathname);

    if (pathname.startsWith("/dashboard")) {
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        return Response.redirect(new URL(defaultHomeForRole(session.user.role), req.url));
      }
      return;
    }

    const required = requiredRoleForPath(pathname);
    if (required && session.user.role !== required) {
      return Response.redirect(new URL("/acces-refuse", req.url));
    }
    return;
  }

  if (
    pathname === "/" ||
    pathname === "/patient" ||
    pathname === "/patient/" ||
    pathname.startsWith("/onboarding") ||
    pathname === "/contact" ||
    pathname.startsWith("/politique-") ||
    pathname.startsWith("/conditions-") ||
    pathname === "/conformite" ||
    pathname === "/garantie"
  ) {
    return;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) return loginRedirect(req, pathname);
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return Response.redirect(new URL(defaultHomeForRole(session.user.role), req.url));
    }
    return;
  }

  const required = requiredRoleForPath(pathname);
  if (!required) return;

  if (!session) return loginRedirect(req, pathname);

  if (session.user.role !== required) {
    return Response.redirect(new URL("/acces-refuse", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
