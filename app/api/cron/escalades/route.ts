import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runEscalades } from "@/lib/cron/escalades";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await runEscalades();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return catchRouteError("cron/escalades/GET", async () => {
    return handle(req);
  });
}

export async function POST(req: Request) {
  return catchRouteError("cron/escalades/POST", async () => {
    return handle(req);
  });
}
