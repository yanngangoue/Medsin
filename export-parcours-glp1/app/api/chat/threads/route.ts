import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateIpsThread, listThreadsForIps } from "@/lib/chat/service";
import { IPS_RESPONSE_SLA } from "@/lib/chat/business-hours";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const urgentOnly = searchParams.get("urgent") === "1";

  if (isDemoMode()) {
    return NextResponse.json({
      threads: [],
      coachAvailable: true,
      responseSla: IPS_RESPONSE_SLA,
    });
  }

  if (session.user.role === "PATIENT") {
    const ipsThread = await getOrCreateIpsThread(session.user.id);
    return NextResponse.json({
      threads: ipsThread ? [ipsThread] : [],
      coachAvailable: true,
      responseSla: IPS_RESPONSE_SLA,
    });
  }

  if (session.user.role === "IPS" || session.user.role === "MEDECIN") {
    const threads = await listThreadsForIps(session.user.id, { urgentOnly });
    return NextResponse.json({ threads, responseSla: IPS_RESPONSE_SLA });
  }

  return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
}
