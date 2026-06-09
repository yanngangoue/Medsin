import type { NextRequest } from "next/server";
import { handlers } from "@/auth.node";
import { catchRouteError } from "@/lib/api/catch-route-error";

export async function GET(req: NextRequest) {
  return catchRouteError("auth/nextauth/GET", () => handlers.GET(req));
}

export async function POST(req: NextRequest) {
  return catchRouteError("auth/nextauth/POST", () => handlers.POST(req));
}
