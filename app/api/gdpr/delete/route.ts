import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { anonymizePatientAccount } from "@/lib/gdpr/anonymize";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients" }, { status: 403 });
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
}
