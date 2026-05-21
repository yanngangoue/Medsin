import { NextResponse } from "next/server";
import { z } from "zod";
import { computeBmi, simulateGlp1Eligibility } from "@/lib/eligibility";
import { getSessionUser } from "@/lib/session";
import { unauthorized, badRequest } from "@/lib/api-errors";

const schema = z.object({
  age: z.number().int(),
  weightKg: z.number(),
  heightCm: z.number(),
  medicalHistory: z.string(),
});

/** Simulation uniquement — pas d’avis médical. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return badRequest();

  const { age, weightKg, heightCm, medicalHistory } = parsed.data;
  const bmi = computeBmi(weightKg, heightCm);
  const result = simulateGlp1Eligibility({ age, bmi, medicalHistory });

  return NextResponse.json({
    bmi,
    status: result.status,
    disclaimer:
      "Résultat de simulation logicielle à des fins de démonstration uniquement. Ce n’est pas un avis médical.",
  });
}
