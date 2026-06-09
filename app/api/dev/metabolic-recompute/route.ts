import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDevInteropTestPageEnabled } from "@/lib/dev-interop-page";
import { recomputeMetabolicProfileForPatient } from "@/lib/metabolic/profile-compute";

/** POST — recalcul profil métabolique. PATIENT : soi-même. ADMIN : corps `{ "patientUserId": "uuid" }`. */
export async function POST(req: Request) {
  return catchRouteError("dev/metabolic-recompute/POST", async () => {
    if (!isDevInteropTestPageEnabled()) {
        return NextResponse.json({ error: "Non disponible", code: "NOT_FOUND" }, { status: 404 });
      }
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      let targetPatientId = session.user.id;
      if (session.user.role === "ADMIN") {
        const body = (await req.json().catch(() => ({}))) as { patientUserId?: string };
        if (!body.patientUserId?.trim()) {
          return NextResponse.json({ error: "patientUserId requis pour ADMIN", code: "VALIDATION_ERROR" }, { status: 400 });
        }
        targetPatientId = body.patientUserId.trim();
      } else if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Réservé PATIENT ou ADMIN", code: "FORBIDDEN" }, { status: 403 });
      }
    
      await recomputeMetabolicProfileForPatient(targetPatientId);
      return NextResponse.json({ ok: true, patientUserId: targetPatientId });
  });
}
