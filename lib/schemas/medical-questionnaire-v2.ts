import { z } from "zod";

const medicationEntry = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

export const medicalQuestionnaireV2Schema = z.object({
  sessionId: z.string().uuid().optional(),
  // Section 1
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(400),
  targetWeight: z.number().min(30).max(400),
  waistCm: z.number().min(40).max(250).optional(),
  // Section 2
  chronicConditions: z.array(z.string()),
  surgeries: z.string().optional(),
  recentHospitalization: z.boolean().default(false),
  // Section 3
  medications: z.array(medicationEntry).default([]),
  allergies: z.string().optional(),
  supplements: z.string().optional(),
  // Section 4
  triedWeightLoss: z.boolean(),
  previousResults: z.string().optional(),
  motivation: z.string().min(1),
  medicationPreference: z.enum(["ozempic", "wegovy", "generic", "none"]).default("none"),
  // Section 5
  activityDays: z.enum(["0", "1-2", "3-4", "5+"]),
  dietNotes: z.string().optional(),
  tobacco: z.enum(["never", "former", "current"]),
  alcohol: z.enum(["none", "occasional", "regular"]),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().int().min(1).max(5),
  // Section 6
  consentMedical: z.literal(true),
  consentDataSharing: z.literal(true),
  consentAiCoach: z.literal(true),
  consentPrivacy: z.literal(true),
});

export type MedicalQuestionnaireV2 = z.infer<typeof medicalQuestionnaireV2Schema>;

export const medicalQuestionnaireDraftSchema = medicalQuestionnaireV2Schema.partial();

export type MedicalQuestionnaireDraft = z.infer<typeof medicalQuestionnaireDraftSchema>;
