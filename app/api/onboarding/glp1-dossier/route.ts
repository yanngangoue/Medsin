import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { isDemoMode } from "@/lib/is-demo-mode";
import {
  getGlp1DossierForUser,
  glp1AnswersSchema,
  persistGlp1Dossier,
} from "@/lib/patient/glp1-dossier";
import type { Glp1EligibilityAnswers } from "@/lib/patient/glp1-eligibility-questions";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function GET() {
  return catchRouteError("onboarding/glp1-dossier/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ submitted: false, summary: null, answers: null });
      }
    
      const dossier = await getGlp1DossierForUser(session.user.id);
      return NextResponse.json(dossier);
  });
}

export async function POST(req: Request) {
  return catchRouteError("onboarding/glp1-dossier/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: "Requête invalide", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      const answers = (body as { answers?: Glp1EligibilityAnswers }).answers;
      const parsed = glp1AnswersSchema.safeParse(answers);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données d'évaluation invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json(
          { submitted: true, summary: { eligibility: "MEDICAL_REVIEW_REQUIRED" } },
          { status: 201 },
        );
      }
    
      try {
        const displayName = [session.user.prenom, session.user.name].filter(Boolean).join(" ").trim();
        const summary = await persistGlp1Dossier(
          session.user.id,
          parsed.data,
          displayName || undefined,
        );
    
        await writeAuditLog({
          userId: session.user.id,
          action: "glp1_dossier_submit",
          entity: "gestion-poids",
          ipAddress: clientIp(req),
        });
    
        return NextResponse.json({ submitted: true, summary }, { status: 201 });
      } catch (e) {
        console.error("[glp1-dossier]", e);
        if (e instanceof Error && e.message === "INVALID_GLP1_ANSWERS") {
          return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
        }
        return NextResponse.json(
          { error: "Impossible d'enregistrer le dossier GLP-1" },
          { status: 500 },
        );
      }
  });
}
