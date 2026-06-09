import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
});

/** Associe une session d'éligibilité anonyme au compte patient connecté. */
export async function POST(req: Request) {
  return catchRouteError("onboarding/eligibilite/link/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const body: unknown = await req.json().catch(() => null);
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "sessionId requis", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ ok: true, linked: 0 });
      }
    
      const result = await prisma.eligibilityCheck.updateMany({
        where: { sessionId: parsed.data.sessionId, userId: null },
        data: { userId: session.user.id },
      });
    
      return NextResponse.json({ ok: true, linked: result.count });
  });
}
