import { z } from "zod";
import { ADMIN_INVITABLE_ROLES } from "@/lib/admin/staff-roles";

const pharmacySchema = z.object({
  name: z.string().trim().min(2, "Nom de la pharmacie requis"),
  address: z.string().trim().min(3, "Adresse requise"),
  city: z.string().trim().min(2, "Ville requise"),
  province: z.string().trim().min(2, "Province requise").max(2, "Code province (ex. QC)"),
  phone: z.string().trim().min(10, "Téléphone requis"),
});

export const createStaffMemberSchema = z
  .object({
    role: z.enum(ADMIN_INVITABLE_ROLES),
    prenom: z.string().trim().min(2, "Prénom requis"),
    nom: z.string().trim().min(2, "Nom requis"),
    email: z.string().trim().email("Courriel invalide").optional(),
    /** Courriel personnel pour recevoir le lien d'activation (la boîte @medsim.ca n'existe pas encore). */
    notificationEmail: z.string().trim().email("Courriel de notification invalide").optional(),
    licenseNumber: z.string().trim().min(2, "Numéro de permis requis").optional(),
    pharmacy: pharmacySchema.optional(),
    sendInvite: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if ((data.role === "IPS" || data.role === "MEDECIN") && !data.licenseNumber?.trim()) {
      ctx.addIssue({
        code: "custom",
        message:
          data.role === "IPS"
            ? "Numéro de permis IPS requis"
            : "Numéro de permis médical requis",
        path: ["licenseNumber"],
      });
    }
    if (data.role === "PHARMACIEN" && !data.pharmacy) {
      ctx.addIssue({
        code: "custom",
        message: "Informations de la pharmacie partenaire requises",
        path: ["pharmacy"],
      });
    }
  });

export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;
