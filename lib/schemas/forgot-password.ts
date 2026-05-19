import { z } from "zod";

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Courriel invalide"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(16, "Lien invalide"),
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ForgotPasswordRequestValues = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
