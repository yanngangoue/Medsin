import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { evaluateEligibility } from "@/lib/onboarding/eligibility-result";
import type { EligibilityDraft } from "@/lib/onboarding/eligibility-session";
import { eligibilityWizardSchema } from "@/lib/schemas/eligibility-wizard";
import { computeBmi } from "@/lib/eligibility";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = eligibilityWizardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
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

  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!isDemoMode()) {
    await prisma.eligibilityCheck.create({
      data: {
        sessionId: data.sessionId,
        userId,
        age: data.age,
        bmi,
        hasDiabetes: data.hasDiabetes === "yes",
        hasThyroidCancer: data.hasThyroidOrPancreatitis,
        hasOtherContraindications: data.isPregnantOrNursing,
        status: result.status,
      },
    });
  }

  return NextResponse.json({ result, bmi, draft });
}
