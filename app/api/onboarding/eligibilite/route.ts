import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo-mode";
import { evaluateEligibility } from "@/lib/onboarding/eligibility-result";
import type { EligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { eligibilityWizardSchema } from "@/lib/schemas/eligibility-wizard";
import { computeBmi } from "@/lib/eligibility";
import { prisma } from "@/lib/prisma";

export type EligibilityApiStatus = "ELIGIBLE" | "NOT_ELIGIBLE" | "BORDERLINE";

function toApiStatus(status: ReturnType<typeof evaluateEligibility>["status"]): EligibilityApiStatus {
  if (status === "ELIGIBLE") return "ELIGIBLE";
  if (status === "MEDICAL_REVIEW_REQUIRED") return "BORDERLINE";
  return "NOT_ELIGIBLE";
}

export async function POST(req: Request) {
  return catchRouteError("onboarding/eligibilite/POST", async () => {
    try {
        const body: unknown = await req.json().catch(() => null);
        const parsed = eligibilityWizardSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
        }
    
        const data = parsed.data;
        const bmi = computeBmi(data.weightKg, data.heightCm);
    
        const draft: EligibilityDraft = {
          age: data.age,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          bmi,
          hasDiabetes: data.hasDiabetes,
          hasThyroidOrPancreatitis: data.hasThyroidOrPancreatitis,
          isPregnantOrNursing: data.isPregnantOrNursing,
        };
    
        const result = evaluateEligibility(draft);
        const status = toApiStatus(result.status);
    
        if (!isDemoMode()) {
          try {
            await prisma.eligibilityCheck.create({
              data: {
                sessionId: data.sessionId,
                userId: null,
                age: data.age,
                bmi,
                hasDiabetes: data.hasDiabetes === "yes",
                hasThyroidCancer: data.hasThyroidOrPancreatitis,
                hasOtherContraindications: data.isPregnantOrNursing,
                status: result.status,
              },
            });
          } catch (dbError) {
            console.error("[eligibilite] Échec sauvegarde EligibilityCheck:", dbError);
          }
        }
    
        return NextResponse.json({ status, bmi, result });
      } catch (error) {
        console.error("[eligibilite] POST error:", error);
        return NextResponse.json({ error: "Erreur serveur", code: "INTERNAL_ERROR" }, { status: 500 });
      }
  });
}
