import { z } from "zod";

export const connexionSchema = z.object({
  email: z.string().email("Courriel invalide"),
  password: z.string().min(8, "Au moins 8 caractères"),
});

export type ConnexionFormValues = z.infer<typeof connexionSchema>;
