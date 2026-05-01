import { z } from "zod";

const objectifEnum = z.enum(["perte", "glycemie", "les_deux"]);
const antecedentEnum = z.enum([
  "diabete_t2",
  "hypertension",
  "cardiovasculaire",
  "rein",
  "aucun",
]);

const positiveString = (emptyMsg: string) =>
  z
    .string()
    .min(1, emptyMsg)
    .refine((s) => {
      const n = Number(s.replace(",", "."));
      return Number.isFinite(n) && n > 0;
    }, "Valeur invalide");

export const questionnaireFormSchema = z
  .object({
    objectif: objectifEnum,
    poidsKg: positiveString("Indiquez votre poids"),
    tailleCm: positiveString("Indiquez votre taille"),
    glp1Essaye: z.boolean(),
    glp1Lequel: z.string().optional(),
    antecedents: z.array(antecedentEnum).min(1, "Sélectionnez au moins une option"),
    medicaments: z.boolean(),
    medicamentsLesquels: z.string().optional(),
  })
  .refine((d) => !d.glp1Essaye || (d.glp1Lequel?.trim().length ?? 0) > 0, {
    message: "Indiquez le traitement",
    path: ["glp1Lequel"],
  })
  .refine((d) => !d.medicaments || (d.medicamentsLesquels?.trim().length ?? 0) > 0, {
    message: "Indiquez vos médicaments",
    path: ["medicamentsLesquels"],
  });

export type QuestionnaireFormValues = z.infer<typeof questionnaireFormSchema>;

/** Corps JSON pour `POST /api/questionnaire`. */
export function questionnaireFormToApiBody(data: QuestionnaireFormValues) {
  return {
    objectif: data.objectif,
    poids: Number(data.poidsKg.replace(",", ".")),
    taille: Number(data.tailleCm.replace(",", ".")),
    glpAntecedent: data.glp1Essaye,
    glpLequel:
      data.glp1Essaye && data.glp1Lequel?.trim() ? data.glp1Lequel.trim() : undefined,
    antecedents: [...data.antecedents] as string[],
    medicaments: data.medicaments,
    medicamentsDesc:
      data.medicaments && data.medicamentsLesquels?.trim()
        ? data.medicamentsLesquels.trim()
        : undefined,
  };
}
