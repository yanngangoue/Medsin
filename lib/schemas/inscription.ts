import { z } from "zod";

export const inscriptionSchema = z
  .object({
    prenom: z.string().min(1, "Le prénom est requis"),
    nom: z.string().min(1, "Le nom de famille est requis"),
    email: z.string().email("Courriel invalide"),
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type InscriptionFormValues = z.infer<typeof inscriptionSchema>;

/** Parcours onboarding wizard — prénom seulement, pas de nom de famille. */
export const onboardingInscriptionSchema = z
  .object({
    prenom: z.string().min(1, "Le prénom est requis"),
    email: z.string().email("Courriel invalide"),
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type OnboardingInscriptionFormValues = z.infer<typeof onboardingInscriptionSchema>;
