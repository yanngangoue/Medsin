import { z } from "zod";

export const mealIntakeSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        brand: z.string().optional(),
        energyKcal: z.number().optional(),
        proteinG: z.number().optional(),
        carbG: z.number().optional(),
        fatG: z.number().optional(),
      }),
    )
    .min(1),
  consumedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const supplementIntakeSchema = z.object({
  productName: z.string().min(1),
  doseText: z.string().optional(),
  takenAt: z.string().optional(),
  ingredientsNote: z.string().optional(),
});

export const sleepIntakeSchema = z.object({
  hours: z.number().min(0).max(24),
  quality: z.enum(["poor", "fair", "good"]).optional(),
  nightOfDate: z.string().optional(),
});

export const activityIntakeSchema = z.object({
  minutes: z.number().min(0).max(1440),
  intensity: z.enum(["light", "moderate", "vigorous"]).optional(),
  day: z.string().optional(),
});

export const glp1IntakeSchema = z.object({
  productDisplay: z.string().min(1),
  takenAt: z.string().optional(),
  dosageText: z.string().optional(),
  note: z.string().optional(),
});

export const dietaryConsentSchema = z.object({
  optIn: z.boolean(),
  version: z.string().optional(),
});
