import type { NextRequest } from "next/server";

export function isQuestionnairePath(pathname: string): boolean {
  return pathname === "/questionnaire" || pathname.startsWith("/questionnaire/");
}

/** Interroge la DB via route API interne (Prisma indisponible en middleware Edge). */
export async function hasGlp1MembershipPaid(req: NextRequest): Promise<boolean> {
  const url = new URL("/api/membership/glp1-paid-check", req.nextUrl.origin);
  const res = await fetch(url, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { paid?: boolean };
  return data.paid === true;
}
