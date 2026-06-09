import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { getPatientConsents, updatePatientConsents } from "@/lib/gdpr/consents";
import { isDemoMode } from "@/lib/is-demo-mode";

const patchSchema = z.object({
  medical: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
  aiCoach: z.boolean().optional(),
  privacy: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export async function GET() {
  return catchRouteError("gdpr/consents GET", async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      medical: true,
      dataSharing: true,
      aiCoach: true,
      privacy: true,
      marketing: false,
    });
  }

  const consents = await getPatientConsents(session.user.id);
  return NextResponse.json(consents);
  });
}

export async function PATCH(req: Request) {
  return catchRouteError("gdpr/consents PATCH", async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, ...parsed.data });
  }

  const consents = await updatePatientConsents(session.user.id, parsed.data);
  return NextResponse.json(consents);
  });
}
