import { z } from "zod";

export const createWeightProgramSchema = z.object({
  startWeight: z.number().positive().max(400),
  targetWeight: z.number().positive().max(400),
  currentWeight: z.number().positive().max(400).optional(),
  targetDate: z.string().datetime().optional(),
  checkInFreq: z.enum(["DAILY", "WEEKLY"]).optional(),
});

export const updateWeightProgramSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  targetWeight: z.number().positive().max(400).optional(),
  currentWeight: z.number().positive().max(400).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  checkInFreq: z.enum(["DAILY", "WEEKLY"]).optional(),
  stripeSubId: z.string().min(1).optional(),
});

export const createCheckInSchema = z.object({
  weight: z.number().positive().max(400),
  energie: z.number().int().min(1).max(5).optional(),
  sommeil: z.number().min(4).max(10).optional(),
  nausee: z.number().int().min(0).max(5).optional(),
  notes: z.string().max(2000).optional(),
});

export const coachMessageSchema = z.object({
  message: z.string().min(1).max(4000),
});
