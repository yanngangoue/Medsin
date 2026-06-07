import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runRappelCheckIn } from "@/lib/cron/rappel-check-in";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await runRappelCheckIn();
  return NextResponse.json({ ok: true, ...result });
}

/** Lundi 9 h (America/Toronto) — Bearer MEDSIM_CRON_SECRET */
export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
