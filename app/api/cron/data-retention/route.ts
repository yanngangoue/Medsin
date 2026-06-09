import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runDataRetention } from "@/lib/cron/data-retention";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await runDataRetention();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return catchRouteError("cron/data-retention/GET", async () => {
    return handle(req);
  });
}

export async function POST(req: Request) {
  return catchRouteError("cron/data-retention/POST", async () => {
    return handle(req);
  });
}
