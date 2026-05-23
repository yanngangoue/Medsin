import { auth } from "./auth.edge";
import { defaultHomeForRole, requiredRoleForPath } from "@/lib/rbac";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const login = new URL("/connexion", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return Response.redirect(login);
    }
    return Response.redirect(new URL(defaultHomeForRole(session.user.role), req.url));
  }

  const required = requiredRoleForPath(pathname);
  if (!required) {
    return;
  }

  if (!session) {
    const login = new URL("/connexion", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return Response.redirect(login);
  }

  if (session.user.role !== required) {
    return Response.redirect(new URL("/acces-refuse", req.url));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patient/:path*",
    "/pharmacien/:path*",
    "/medecin/:path*",
    "/nutritionniste/:path*",
    "/admin/:path*",
  ],
};
