import { z } from "zod";

const medicationEntry = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

const yesNoSchema = z.enum(["oui", "non"]);
const genderSchema = z.enum(["male", "female"]);
const bloodPressureSchema = z.enum(["normal", "elevated", "stage1", "stage2"]);
const heartRateSchema = z.enum(["slow", "normal", "slightly_fast", "fast"]);

export const medicalQuestionnaireV2Schema = z.object({
  sessionId: z.string().uuid().optional(),
  // Identité
  gender: genderSchema,
  birthMonth: z.string().min(1),
  birthDay: z.string().min(1),
  birthYear: z.string().min(4),
  // Biométrie
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(400),
  targetWeight: z.number().min(30).max(400),
  waistCm: z.number().min(40).max(250).optional(),
  // Dépistage clinique (listes GLP-1)
  health1: z.array(z.string()).min(1),
  health2: z.array(z.string()).min(1),
  health3: z.array(z.string()).min(1),
  opioids3Months: yesNoSchema,
  bariatricSurgery: yesNoSchema,
  prescriptionMeds: yesNoSchema,
  bloodPressure: bloodPressureSchema,
  restingHeartRate: heartRateSchema,
  // Médicaments
  medications: z.array(medicationEntry).default([]),
  allergies: z.string().optional(),
  supplements: z.string().optional(),
  // Parcours GLP-1
  triedWeightLoss: z.boolean(),
  previousResults: z.string().optional(),
  motivation: z.string().min(1),
  medicationPreference: z.enum(["ozempic", "wegovy", "generic", "none"]).default("none"),
  // Mode de vie
  activityDays: z.enum(["0", "1-2", "3-4", "5+"]),
  dietNotes: z.string().optional(),
  tobacco: z.enum(["never", "former", "current"]),
  alcohol: z.enum(["none", "occasional", "regular"]),
  sleepHours: z.number().min(0).max(24),
  stressLevel: z.number().int().min(1).max(5),
  // Consentements
  consentMedical: z.literal(true),
  consentDataSharing: z.literal(true),
  consentAiCoach: z.literal(true),
  consentPrivacy: z.literal(true),
});

export type MedicalQuestionnaireV2 = z.infer<typeof medicalQuestionnaireV2Schema>;

export const medicalQuestionnaireDraftSchema = medicalQuestionnaireV2Schema.partial();

export type MedicalQuestionnaireDraft = z.infer<typeof medicalQuestionnaireDraftSchema>;
