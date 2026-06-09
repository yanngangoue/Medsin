import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Courriel invalide"),
  password: z.string().min(8, "Au moins 8 caractères"),
});

export const loginSchema = registerSchema;

export const onboardingSchema = z.object({
  age: z.coerce.number().int().min(18, "Âge minimum 18").max(120),
  weightKg: z.coerce.number().positive("Poids invalide").max(400),
  heightCm: z.coerce.number().positive("Taille invalide").max(280),
  medicalHistory: z.string().min(10, "Précisez un minimum d’informations (simulation)").max(8000),
});

export const appointmentSchema = z.object({
  scheduledAt: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
});
