import type { Request, Response } from "express";
import { z } from "zod";
import { computeBmi, simulateGlp1Eligibility } from "../../lib/eligibility";

const schema = z.object({
  age: z.number().int(),
  weightKg: z.number(),
  heightCm: z.number(),
  medicalHistory: z.string(),
});

/** Simulation uniquement — pas d’avis médical. */
export async function simulate(req: Request, res: Response) {
  if (!req.auth?.sub) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { age, weightKg, heightCm, medicalHistory } = parsed.data;
  const bmi = computeBmi(weightKg, heightCm);
  const result = simulateGlp1Eligibility({ age, bmi, medicalHistory });

  res.json({
    bmi,
    status: result.status,
    labelFr: result.labelFr,
    disclaimer:
      "Résultat de simulation logicielle à des fins de démonstration uniquement. Ce n’est pas un avis médical.",
  });
}
