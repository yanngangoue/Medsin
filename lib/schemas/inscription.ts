import { z } from "zod";

const namePart = z
  .string()
  .trim()
  .min(1, "Ce champ est requis")
  .max(80, "80 caractères maximum");

export const inscriptionSchema = z
  .object({
    prenom: namePart,
    nom: namePart,
    email: z.string().trim().email("Courriel invalide"),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Za-z]/, "Au moins une lettre")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type InscriptionFormValues = z.infer<typeof inscriptionSchema>;

export function formatFullName(prenom: string, nom: string): string {
  return `${prenom.trim()} ${nom.trim()}`.replace(/\s+/g, " ").trim();
}
