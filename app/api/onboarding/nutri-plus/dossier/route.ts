import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { isDemoMode } from "@/lib/is-demo-mode";
import {
  getNutriPlusDossierForUser,
  persistNutriPlusDossier,
} from "@/lib/patient/nutri-plus-dossier";
import type { NutriPlusAnswers } from "@/lib/patient/nutri-plus-questions";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ submitted: false, answers: null, submittedAt: null });
  }

  const dossier = await getNutriPlusDossierForUser(session.user.id);
  return NextResponse.json(dossier);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const answers = (body as { answers?: NutriPlusAnswers }).answers;
  if (!answers) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ submitted: true, submittedAt: new Date().toISOString() }, { status: 201 });
  }

  try {
    const displayName = [session.user.prenom, session.user.name].filter(Boolean).join(" ").trim();
    const result = await persistNutriPlusDossier(session.user.id, answers, displayName || undefined);

    await writeAuditLog({
      userId: session.user.id,
      action: "nutri_plus_dossier_submit",
      entity: "nutri-plus",
      ipAddress: clientIp(req),
    });

    return NextResponse.json({ submitted: true, ...result }, { status: 201 });
  } catch (e) {
    console.error("[nutri-plus-dossier]", e);
    if (e instanceof Error && e.message === "INVALID_NUTRI_ANSWERS") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre profil Nutri+" },
      { status: 500 },
    );
  }
}
