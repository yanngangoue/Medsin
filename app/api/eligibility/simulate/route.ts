import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { computeBmi, explainGlp1SimulationStatus, simulateGlp1Eligibility } from "@/lib/eligibility";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  age: z.number().int(),
  weightKg: z.number(),
  heightCm: z.number(),
  medicalHistory: z.string(),
});

/** Simulation uniquement — pas d'avis médical. */
export async function POST(req: Request) {
  return catchRouteError("eligibility/simulate/POST", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (user.role !== "PATIENT") return forbidden();
    
      const raw: unknown = await req.json().catch(() => null);
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
    
      const { age, weightKg, heightCm, medicalHistory } = parsed.data;
      const bmi = computeBmi(weightKg, heightCm);
      const result = simulateGlp1Eligibility({ age, bmi, medicalHistory });
    
      return NextResponse.json({
        bmi,
        eligibility: result.status,
        labelFr: result.labelFr,
        reason: explainGlp1SimulationStatus(result.status, bmi, medicalHistory),
        disclaimer: "Simulation indicative — seul un professionnel de santé peut confirmer l'admissibilité.",
      });
  });
}
