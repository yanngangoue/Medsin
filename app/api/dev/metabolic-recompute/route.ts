import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDevInteropTestPageEnabled } from "@/lib/dev-interop-page";
import { recomputeMetabolicProfileForPatient } from "@/lib/metabolic/profile-compute";

/** POST — recalcul profil métabolique. PATIENT : soi-même. ADMIN : corps `{ "patientUserId": "uuid" }`. */
export async function POST(req: Request) {
  if (!isDevInteropTestPageEnabled()) {
    return NextResponse.json({ error: "Non disponible" }, { status: 404 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let targetPatientId = session.user.id;
  if (session.user.role === "ADMIN") {
    const body = (await req.json().catch(() => ({}))) as { patientUserId?: string };
    if (!body.patientUserId?.trim()) {
      return NextResponse.json({ error: "patientUserId requis pour ADMIN" }, { status: 400 });
    }
    targetPatientId = body.patientUserId.trim();
  } else if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé PATIENT ou ADMIN" }, { status: 403 });
  }

  await recomputeMetabolicProfileForPatient(targetPatientId);
  return NextResponse.json({ ok: true, patientUserId: targetPatientId });
}
