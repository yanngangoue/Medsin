import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runRapportIps } from "@/lib/cron/rapport-ips";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await runRapportIps();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return catchRouteError("cron/rapport-ips/GET", async () => {
    return handle(req);
  });
}

export async function POST(req: Request) {
  return catchRouteError("cron/rapport-ips/POST", async () => {
    return handle(req);
  });
}
