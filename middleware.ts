import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessPath, requiredRoleForPath } from "@/lib/rbac";
import {
  hasGlp1MembershipPaid,
  isQuestionnairePath,
} from "@/lib/membership/glp1-membership-middleware";

export default auth(async (req) => {
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

  if (isQuestionnairePath(pathname) && role === "PATIENT") {
    const paid = await hasGlp1MembershipPaid(req);
    if (!paid) {
      const payment = new URL("/paiement", req.url);
      payment.searchParams.set("onboarding", "1");
      return NextResponse.redirect(payment);
    }
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
