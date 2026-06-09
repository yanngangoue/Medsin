import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runRappelCheckIn } from "@/lib/cron/rappel-check-in";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await runRappelCheckIn();
  return NextResponse.json({ ok: true, ...result });
}

/** Lundi 9 h (America/Toronto) — Bearer MEDSIM_CRON_SECRET */
export async function GET(req: Request) {
  return catchRouteError("cron/rappel-check-in/GET", async () => {
    return handle(req);
  });
}

export async function POST(req: Request) {
  return catchRouteError("cron/rappel-check-in/POST", async () => {
    return handle(req);
  });
}
