import { z } from "zod";

export const eligibilityWizardSchema = z.object({
  sessionId: z.string().uuid(),
  age: z.number().int().min(18).max(120),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(400),
  hasDiabetes: z.enum(["yes", "no", "unknown"]),
  hasThyroidOrPancreatitis: z.boolean(),
  isPregnantOrNursing: z.boolean(),
});

export type EligibilityWizardPayload = z.infer<typeof eligibilityWizardSchema>;
