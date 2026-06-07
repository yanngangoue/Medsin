import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { buildPatientDataExport } from "@/lib/gdpr/export";
import { isDemoMode } from "@/lib/is-demo-mode";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ exportedAt: new Date().toISOString(), demo: true });
  }

  const data = await buildPatientDataExport(session.user.id);

  await writeAuditLog({
    userId: session.user.id,
    action: "gdpr_export",
    entity: session.user.id,
  });

  return NextResponse.json(data, {
    headers: {
      "Content-Disposition": `attachment; filename="medsim-donnees-${session.user.id}.json"`,
    },
  });
}
