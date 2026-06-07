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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Réservé aux patients" }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, linked: 0 });
  }

  const result = await prisma.eligibilityCheck.updateMany({
    where: { sessionId: parsed.data.sessionId, userId: null },
    data: { userId: session.user.id },
  });

  return NextResponse.json({ ok: true, linked: result.count });
}
