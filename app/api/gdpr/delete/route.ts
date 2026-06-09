import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { writeAuditLog } from "@/lib/audit";
import { anonymizePatientAccount } from "@/lib/gdpr/anonymize";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function POST() {
  return catchRouteError("gdpr/delete", async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "gdpr_delete_requested",
    entity: session.user.id,
  });

  await anonymizePatientAccount(session.user.id);

  return NextResponse.json({ ok: true, message: "Compte anonymisé" });
  });
}
