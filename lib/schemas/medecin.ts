import { z } from "zod";

export const medecinDecisionSchema = z
  .object({
    decision: z.enum(["APPROUVE", "REFUSE", "INFO_REQUISE"]),
    notesMedecin: z.string().min(50, "Notes cliniques : minimum 50 caractères"),
    motifRefus: z.string().max(4000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.decision === "REFUSE" && (!data.motifRefus || data.motifRefus.trim().length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motif de refus obligatoire (min. 10 caractères)",
        path: ["motifRefus"],
      });
    }
  });

export const createOrdonnanceSchema = z.object({
  dossierId: z.string().uuid(),
  medicament: z.string().min(2),
  dosage: z.string().min(2),
  frequence: z.string().min(2),
  duree: z.string().min(2),
  instructions: z.string().min(1),
  modeAdministration: z.string().optional(),
  renouvellementAutorise: z.boolean().optional(),
  nombreRenouvellements: z.number().int().min(0).max(3).optional(),
});

export const signOrdonnanceSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});
