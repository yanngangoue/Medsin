import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { enregistrerMessageProactifApresCheckIn } from "@/lib/patient/ai-coach";
import { addWeightCheckIn, listCheckIns } from "@/lib/patient/weight-program";
import { createCheckInSchema } from "@/lib/schemas/weight-program";

function patientPrenom(session: { user: { prenom?: string | null; name?: string | null } }): string {
  return session.user.prenom ?? session.user.name ?? "";
}

export async function GET() {
  return catchRouteError("patient/weight-program/check-ins/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ checkIns: [] });
      }
    
      const checkIns = await listCheckIns(session.user.id);
      return NextResponse.json({ checkIns });
  });
}

export async function POST(req: Request) {
  return catchRouteError("patient/weight-program/check-ins/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const body: unknown = await req.json().catch(() => null);
      const parsed = createCheckInSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({
          program: {
            id: "demo-program",
            currentWeight: parsed.data.weight,
            progressPct: 25,
            weightLost: 3.5,
          },
          coachMessage: {
            role: "assistant",
            content: `Bilan hebdomadaire à ${parsed.data.weight} kg enregistré. En mode démo, configurez ANTHROPIC_API_KEY pour un message personnalisé.`,
          },
        });
      }
    
      const result = await addWeightCheckIn(session.user.id, parsed.data);
      if (!result) {
        return NextResponse.json({ error: "Programme introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const coachMessage = await enregistrerMessageProactifApresCheckIn({
        userId: session.user.id,
        prenom: patientPrenom(session),
        program: result.program,
        dernierCheckIn: result.latestCheckIn,
      });
    
      return NextResponse.json({ program: result.program, coachMessage }, { status: 201 });
  });
}
