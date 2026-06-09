import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import {
  createWeightProgram,
  getWeightProgramForUser,
  updateWeightProgram,
} from "@/lib/patient/weight-program";
import {
  createWeightProgramSchema,
  updateWeightProgramSchema,
} from "@/lib/schemas/weight-program";

const DEMO_PROGRAM = {
  program: {
    id: "demo-program",
    status: "ACTIVE" as const,
    startWeight: 95,
    targetWeight: 80,
    currentWeight: 91.5,
    weightLost: 3.5,
    progressPct: 23,
    startDate: new Date().toISOString(),
    targetDate: null,
    checkInFreq: "WEEKLY" as const,
    recentCheckIns: [],
  },
};

export async function GET() {
  return catchRouteError("patient/weight-program/GET", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json(DEMO_PROGRAM);
      }
    
      const program = await getWeightProgramForUser(session.user.id);
      return NextResponse.json({ program });
  });
}

export async function POST(req: Request) {
  return catchRouteError("patient/weight-program/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const body: unknown = await req.json().catch(() => null);
      const parsed = createWeightProgramSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json(DEMO_PROGRAM, { status: 201 });
      }
    
      const existing = await getWeightProgramForUser(session.user.id);
      if (existing) {
        return NextResponse.json({ error: "Programme déjà actif", code: "CONFLICT" }, { status: 409 });
      }
    
      const program = await createWeightProgram(session.user.id, {
        startWeight: parsed.data.startWeight,
        targetWeight: parsed.data.targetWeight,
        currentWeight: parsed.data.currentWeight,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
        checkInFreq: parsed.data.checkInFreq,
      });
    
      return NextResponse.json({ program }, { status: 201 });
  });
}

export async function PATCH(req: Request) {
  return catchRouteError("patient/weight-program/PATCH", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
      if (session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Accès réservé aux patients", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const body: unknown = await req.json().catch(() => null);
      const parsed = updateWeightProgramSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json(DEMO_PROGRAM);
      }
    
      const program = await updateWeightProgram(session.user.id, {
        status: parsed.data.status,
        targetWeight: parsed.data.targetWeight,
        currentWeight: parsed.data.currentWeight,
        targetDate:
          parsed.data.targetDate === undefined
            ? undefined
            : parsed.data.targetDate
              ? new Date(parsed.data.targetDate)
              : null,
        checkInFreq: parsed.data.checkInFreq,
        stripeSubId: parsed.data.stripeSubId,
      });
    
      if (!program) {
        return NextResponse.json({ error: "Programme introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      return NextResponse.json({ program });
  });
}
