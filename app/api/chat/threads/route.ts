import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  findPatientIpsThread,
  getOrCreateIpsThread,
  listThreadsForIps,
} from "@/lib/chat/service";
import { IPS_RESPONSE_SLA, isIpsBusinessHours } from "@/lib/chat/business-hours";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function GET(req: Request) {
  return catchRouteError("chat/threads/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { searchParams } = new URL(req.url);
      const urgentOnly = searchParams.get("urgent") === "1";
    
      if (isDemoMode()) {
        return NextResponse.json({
          threads: [],
          coachAvailable: true,
          responseSla: IPS_RESPONSE_SLA,
          ipsAssigned: false,
          businessHoursOpen: isIpsBusinessHours(),
        });
      }
    
      if (session.user.role === "PATIENT") {
        const { ipsAssigned, thread } = await findPatientIpsThread(session.user.id);
        return NextResponse.json({
          threads: thread ? [thread] : [],
          ipsAssigned,
          coachAvailable: true,
          responseSla: IPS_RESPONSE_SLA,
          businessHoursOpen: isIpsBusinessHours(),
        });
      }
    
      if (session.user.role === "IPS" || session.user.role === "MEDECIN") {
        const threads = await listThreadsForIps(session.user.id, { urgentOnly });
        return NextResponse.json({ threads, responseSla: IPS_RESPONSE_SLA });
      }
    
      return NextResponse.json({ error: "Accès refusé", code: "FORBIDDEN" }, { status: 403 });
  });
}

export async function POST() {
  return catchRouteError("chat/threads/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ error: "Indisponible en mode démo", code: "SERVICE_UNAVAILABLE" }, { status: 503 });
      }
    
      const thread = await getOrCreateIpsThread(session.user.id);
      if (!thread) {
        return NextResponse.json(
          { error: "Aucune IPS assignée pour le moment" },
          { status: 404 },
        );
      }
    
      return NextResponse.json({ thread }, { status: 201 });
  });
}
