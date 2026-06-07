import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron/auth";
import { runDataRetention } from "@/lib/cron/data-retention";

async function handle(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await runDataRetention();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
