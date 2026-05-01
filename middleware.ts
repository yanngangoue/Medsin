import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/connexion", req.url));
  }
});

export const config = { matcher: ["/dashboard/:path*"] };
