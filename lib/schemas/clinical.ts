import { z } from "zod";

export const patchEligibilitySchema = z.object({
  status: z.enum(["PENDING", "ELIGIBLE", "NOT_ELIGIBLE", "MEDICAL_REVIEW_REQUIRED"]),
  note: z.string().max(4000).optional(),
  patientMessage: z.string().max(2000).optional(),
  medication: z
    .enum(["SEMAGLUTIDE", "TIRZEPATIDE", "LIRAGLUTIDE", "OTHER", "NONE"])
    .optional(),
  issuePrescription: z.boolean().optional(),
});

export const createPrescriptionSchema = z.object({
  eligibility: z.enum(["ELIGIBLE", "NOT_ELIGIBLE", "MEDICAL_REVIEW_REQUIRED", "PENDING"]),
  medication: z.enum(["SEMAGLUTIDE", "TIRZEPATIDE", "LIRAGLUTIDE", "OTHER", "NONE"]),
  clinicalNote: z.string().max(4000).optional(),
  patientMessage: z.string().max(2000).min(1, "Message patient requis"),
});
